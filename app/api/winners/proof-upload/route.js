import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createServerClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const winnerId = formData.get("winnerId");
    const file = formData.get("file");

    if (!winnerId || !file) {
      return NextResponse.json(
        { error: "Missing winnerId or file" }, 
        { status: 400 }
      );
    }

    // 3. Validate winner ownership
    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .eq("user_id", user.id)
      .single();

    if (winnerError || !winner) {
      return NextResponse.json(
        { error: "Winner record not found or unauthorized" }, 
        { status: 404 }
      );
    }

    // 4. Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload an image file (JPEG, PNG, GIF, or WEBP)" },
        { status: 400 }
      );
    }

    // 5. Validate file size (1KB - 5MB)
    const fileSize = file.size;
    if (fileSize < 1024) {
      return NextResponse.json(
        { error: "File is too small to be a valid image" },
        { status: 400 }
      );
    }
    if (fileSize > 5242880) { // 5MB
      return NextResponse.json(
        { error: "File size must not exceed 5MB" },
        { status: 400 }
      );
    }

    // 6. Sanitize filename
    const originalName = file.name;
    const sanitized = originalName
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/\.+/g, ".")
      .substring(0, 100);
    
    // 7. Generate storage path
    const timestamp = Date.now();
    const storagePath = `${winnerId}/${timestamp}_${sanitized}`;

    // 8. Upload to Supabase Storage with timeout
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadPromise = supabase.storage
      .from("winner-proofs")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Upload timeout")), 30000)
    );

    const { data: uploadData, error: uploadError } = await Promise.race([
      uploadPromise,
      timeoutPromise
    ]).catch((err) => {
      if (err.message === "Upload timeout") {
        return { error: { message: "Upload timed out. Please try again" } };
      }
      return { error: err };
    });

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed. Please try again" },
        { status: 500 }
      );
    }

    // 9. Get public URL
    const { data: urlData } = supabase.storage
      .from("winner-proofs")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // 10. Update winner record with proof URL
    const updatePayload = {
      proof_image_url: publicUrl,
      updated_at: new Date().toISOString()
    };

    // Handle re-upload case: reset status if not pending
    if (winner.verification_status !== "pending") {
      updatePayload.verification_status = "pending";
      updatePayload.rejection_reason = null;
    }

    const { error: updateError } = await supabase
      .from("winners")
      .update(updatePayload)
      .eq("id", winnerId);

    if (updateError) {
      // Rollback: delete uploaded file
      await supabase.storage.from("winner-proofs").remove([storagePath]);
      return NextResponse.json(
        { error: "Upload failed. Please try again" },
        { status: 500 }
      );
    }

    // 11. Optional: Non-blocking URL verification (log only)
    fetch(publicUrl, { method: "HEAD" })
      .then(res => {
        if (!res.ok) {
          console.warn(`Proof URL verification failed for ${winnerId}`);
        }
      })
      .catch(err => console.warn("URL verification error:", err));

    return NextResponse.json({ 
      success: true, 
      proof_url: publicUrl 
    });

  } catch (error) {
    console.error("Proof upload error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
