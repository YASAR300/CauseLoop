"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Table,
  Heart,
  Trophy,
  Settings,
  Plus,
  Copy,
  Check,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ArrowUpRight,
  Lock,
  Play,
  LogOut,
  Sparkles,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Filter,
  Upload,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  DollarSign,
  Activity,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from "recharts";

// Brand Logo Component matching original dashboard logo styling
function Logo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="dash-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5227FF" />
          <stop offset="100%" stopColor="#8644FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#dash-logo-grad)"
        fillRule="evenodd"
        d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Business Data States
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [drawEntries, setDrawEntries] = useState([]);

  // Toast / Status state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Overview / Slider updates
  const [updatingSlider, setUpdatingSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(10);

  // Golf Score Entry Forms
  const [scoreValue, setScoreValue] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [showAddScoreModal, setShowAddScoreModal] = useState(false);
  const [addErrorMessage, setAddErrorMessage] = useState("");
  const [addDuplicateScoreId, setAddDuplicateScoreId] = useState(null);

  // Golf Score Edit Forms
  const [editingScore, setEditingScore] = useState(null);
  const [editScoreValue, setEditScoreValue] = useState("");
  const [editScoreDate, setEditScoreDate] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editDuplicateScoreId, setEditDuplicateScoreId] = useState(null);
  const [showEditScoreModal, setShowEditScoreModal] = useState(false);

  // Charities Directory Filter/Search
  const [charitySearch, setCharitySearch] = useState("");
  const [selectedCharityCategory, setSelectedCharityCategory] = useState("All");

  // General Settings Form
  const [editName, setEditName] = useState("");
  const [editCharityId, setEditCharityId] = useState("");
  const [editContributionPercentage, setEditContributionPercentage] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);

  // Stripe Checkout success overlays
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Command Palette & Search States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  // Admin Panel States
  const [adminTab, setAdminTab] = useState("users");
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [adminCharities, setAdminCharities] = useState([]);
  const [adminDraws, setAdminDraws] = useState([]);
  const [adminWinners, setAdminWinners] = useState([]);
  const [adminDrawEntries, setAdminDrawEntries] = useState([]);

  // Admin User CRUD modal
  const [selectedUserScores, setSelectedUserScores] = useState(null);
  const [showUserScoresModal, setShowUserScoresModal] = useState(false);

  // Admin Charity CRUD Form
  const [showAddCharityModal, setShowAddCharityModal] = useState(false);
  const [newCharityName, setNewCharityName] = useState("");
  const [newCharityDesc, setNewCharityDesc] = useState("");
  const [newCharityImg, setNewCharityImg] = useState("");
  const [newCharityFeatured, setNewCharityFeatured] = useState(false);

  // Admin Draw Simulation Form
  const [drawMonth, setDrawMonth] = useState(new Date().getMonth() + 1);
  const [drawYear, setDrawYear] = useState(new Date().getFullYear());
  const [drawLogic, setDrawLogic] = useState("random");
  const [drawSimulating, setDrawSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [selectedDraw, setSelectedDraw] = useState(null);

  // Admin User Score Correction States
  const [editingUserScoreId, setEditingUserScoreId] = useState(null);
  const [editingUserScoreValue, setEditingUserScoreValue] = useState("");
  const [editingUserScoreDate, setEditingUserScoreDate] = useState("");

  // Admin Charity Events Editor States
  const [editingEventsCharity, setEditingEventsCharity] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [showEventsModal, setShowEventsModal] = useState(false);

  // Admin Winner Claims Filters
  const [claimVerificationFilter, setClaimVerificationFilter] = useState("all");
  const [claimPaymentFilter, setClaimPaymentFilter] = useState("all");

  const [uploadingProof, setUploadingProof] = useState(null); // stores the winnerId of the record currently uploading
  const [uploadError, setUploadError] = useState("");
  const [adminProofModal, setAdminProofModal] = useState(null);
  const [verifyingWinner, setVerifyingWinner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Recharts Mounting Protection
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chart Data Helpers
  const getChartUserData = () => {
    if (!adminProfiles || adminProfiles.length === 0) return [];
    const sorted = [...adminProfiles].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let count = 0;
    const groups = {};
    sorted.forEach((p) => {
      const date = new Date(p.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
      });
      count++;
      groups[date] = count;
    });
    return Object.entries(groups).map(([name, users]) => ({
      name,
      Users: users
    }));
  };

  const getChartCharityData = () => {
    if (!adminCharities || adminCharities.length === 0) return [];
    return adminCharities.map((c) => {
      const count = adminProfiles.filter(
        (p) => p.charity_id === c.id && p.subscriptions?.some((s) => s.status === "active")
      ).length;
      return {
        name: c.name.length > 12 ? c.name.substring(0, 10) + "..." : c.name,
        Supporters: count
      };
    });
  };

  // Toast Trigger
  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdminProfiles(data.profiles || []);
        setAdminCharities(data.charities || []);
        setAdminDraws(data.draws || []);
        setAdminWinners(data.winners || []);
        setAdminDrawEntries(data.drawEntries || []);
      }
    } catch (err) {
      console.error("Error loading admin datasets:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally stable — setters are stable references

  const fetchDrawDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/draws?month=${drawMonth}&year=${drawYear}`);
      if (res.ok) {
        const data = await res.json();
        const drawRow = data.draws?.find(d => d.draw_type === "five_match") || null;
        setSelectedDraw(drawRow);
        setSimulationResults(drawRow?.latest_simulation || null);
        if (drawRow) {
          setDrawLogic(drawRow.logic_type);
        } else {
          // No draw found — reset logic to default so dropdown is unlocked
          setDrawLogic("random");
        }
      } else {
        setSelectedDraw(null);
        setSimulationResults(null);
        setDrawLogic("random");
      }
    } catch (err) {
      console.error("Error fetching draw details:", err);
      setSelectedDraw(null);
      setSimulationResults(null);
    }
  }, [drawMonth, drawYear]);

  // When month/year changes, immediately clear stale draw state while API re-fetches
  useEffect(() => {
    setSelectedDraw(null);
    setSimulationResults(null);
  }, [drawMonth, drawYear]);

  useEffect(() => {
    if (activeTab === "admin_draws" && drawMonth && drawYear) {
      fetchDrawDetails();
    }
  }, [activeTab, drawMonth, drawYear, fetchDrawDetails]);

  // Primary Fetch logic
  const fetchData = useCallback(async (currentUser) => {
    const supabase = createClient();
    const uid = currentUser?.id || user?.id;
    if (!uid) return;
    // Note: fetchAdminData is called separately below to avoid circular dep

    try {
      // 1. Fetch Profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*, charities(*)")
        .eq("id", uid)
        .maybeSingle();

      if (prof) {
        setProfile(prof);
        setEditName(prof.full_name || "");
        setEditCharityId(prof.charity_id || "");
        setEditContributionPercentage(prof.charity_contribution_percentage || 10);
      }

      // 2. Fetch Subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      setSubscription(sub);

      // 3. Fetch user golf scores
      const { data: scoreData } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", uid)
        .order("score_date", { ascending: false })
        .order("created_at", { ascending: false });
      setScores(scoreData || []);

      // 4. Fetch charities
      const { data: charityData } = await supabase
        .from("charities")
        .select("*")
        .order("name", { ascending: true });
      setCharities(charityData || []);

      // 5. Fetch published drawings
      const { data: drawData } = await supabase
        .from("draws")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      setDraws(drawData || []);

      // 6. Fetch user winnings
      const { data: winnerData } = await supabase
        .from("winners")
        .select("*, draws(*)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setWinners(winnerData || []);

      // 7. Fetch user draw entries
      const { data: entryData } = await supabase
        .from("draw_entries")
        .select("*, draws(*)")
        .eq("user_id", uid);
      setDrawEntries(entryData || []);

      // 8. If Admin, fetch admin panels
      if (prof?.role === "admin") {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // stable: only re-create when user identity changes, not on every render


  useEffect(() => {
    const supabase = createClient();
    setScoreDate(new Date().toISOString().split("T")[0]);

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser);

        // Self-healing welcome email fallback check
        fetch("/api/auth/welcome", { method: "POST" })
          .catch((err) => console.error("Welcome email check failed:", err));

        // Check Stripe success redirects
        const searchParams = new URLSearchParams(window.location.search);
        const isCheckoutSuccess = searchParams.get("checkout") === "success";

        if (isCheckoutSuccess) {
          setVerifyingSubscription(true);
          const sessionId = searchParams.get("session_id");

          const cleanAndComplete = (activeSub) => {
            setSubscription(activeSub);
            setVerifyingSubscription(false);
            setShowSuccessModal(true);
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            fetchData(currentUser);
          };

          let attempts = 0;
          const intervalId = setInterval(() => {
            attempts++;
            supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", currentUser.id)
              .maybeSingle()
              .then(({ data: freshSub }) => {
                if (freshSub && freshSub.status === "active") {
                  clearInterval(intervalId);
                  cleanAndComplete(freshSub);
                } else if (attempts >= 10) {
                  clearInterval(intervalId);
                  setVerifyingSubscription(false);
                  setShowPendingModal(true);
                  const cleanUrl = window.location.pathname;
                  window.history.replaceState({}, document.title, cleanUrl);
                }
              });
          }, 1500);

          if (sessionId) {
            fetch(`/api/checkout/confirm?session_id=${sessionId}`)
              .then((res) => res.json())
              .then((data) => {
                if (data && data.status === "active") {
                  clearInterval(intervalId);
                  cleanAndComplete(data.subscription);
                }
              })
              .catch((err) => console.error("Immediate confirmation check failed:", err));
          }
        } else {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });
  }, [router, fetchData]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K Spotlight search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandItems = [
    { id: "overview", label: "Overview", category: "Navigation", icon: Home, action: () => { setActiveTab("overview"); setShowSearchModal(false); } },
    { id: "scores", label: "My Scores", category: "Navigation", icon: Table, action: () => { setActiveTab("scores"); setShowSearchModal(false); } },
    { id: "charity", label: "My Charity", category: "Navigation", icon: Heart, action: () => { setActiveTab("charity"); setShowSearchModal(false); } },
    { id: "draws_winnings", label: "Draws & Winnings", category: "Navigation", icon: Trophy, action: () => { setActiveTab("draws_winnings"); setShowSearchModal(false); } },
    { id: "settings", label: "Project Settings", category: "Navigation", icon: Settings, action: () => { setActiveTab("settings"); setShowSearchModal(false); } },
    ...(profile?.role === "admin" ? [
      { id: "admin_users", label: "Users (Admin)", category: "Administration", icon: Users, action: () => { setActiveTab("admin_users"); setShowSearchModal(false); } },
      { id: "admin_draws", label: "Draws (Admin)", category: "Administration", icon: Trophy, action: () => { setActiveTab("admin_draws"); setShowSearchModal(false); } },
      { id: "admin_charities", label: "Charities (Admin)", category: "Administration", icon: Heart, action: () => { setActiveTab("admin_charities"); setShowSearchModal(false); } },
      { id: "admin_winners", label: "Winners (Admin)", category: "Administration", icon: Award, action: () => { setActiveTab("admin_winners"); setShowSearchModal(false); } },
      { id: "admin_reports", label: "Reports (Admin)", category: "Administration", icon: TrendingUp, action: () => { setActiveTab("admin_reports"); setShowSearchModal(false); } }
    ] : []),
    { id: "add-score", label: "Log Golf Round", category: "Actions", icon: Plus, action: () => { setShowSearchModal(false); setShowAddScoreModal(true); } },
    ...(subscription?.status !== "active" ? [{ id: "upgrade", label: "Upgrade to Pro", category: "Actions", icon: Sparkles, action: () => { router.push("/subscribe"); setShowSearchModal(false); } }] : []),
    { id: "logout", label: "Sign Out", category: "Actions", icon: LogOut, action: () => { handleLogout(); setShowSearchModal(false); } }
  ];

  const filteredSearchItems = commandItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (showSearchModal) {
      setSearchSelectedIndex(0);
      setSearchQuery("");
    }
  }, [showSearchModal]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev + 1) % filteredSearchItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev - 1 + filteredSearchItems.length) % filteredSearchItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSearchItems[searchSelectedIndex]) {
        filteredSearchItems[searchSelectedIndex].action();
      }
    } else if (e.key === "Escape") {
      setShowSearchModal(false);
    }
  };

  // Sync sliderValue whenever profile loads / changes
  useEffect(() => {
    if (profile?.charity_contribution_percentage != null) {
      setSliderValue(profile.charity_contribution_percentage);
    }
  }, [profile?.charity_contribution_percentage]);

  // User Action: Update charity contribution percentage
  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val >= 10 ? val : 10);
  };

  // Debounced effect for sliderValue DB synchronization
  useEffect(() => {
    if (!user?.id || !profile) return;
    if (sliderValue === profile.charity_contribution_percentage) return;

    const timer = setTimeout(async () => {
      setUpdatingSlider(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ charity_contribution_percentage: sliderValue })
        .eq("id", user.id);

      setUpdatingSlider(false);
      if (error) {
        triggerToast(error.message, "error");
      } else {
        setProfile(prev => ({ ...prev, charity_contribution_percentage: sliderValue }));
        triggerToast(`Donation share set to ${sliderValue}%!`, "success");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [sliderValue, user?.id, profile]);

  const handleSliderCommit = () => {};

  // User Action: Select Charity from Directory
  const handleSupportCharity = async (charityId, charityName) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ charity_id: charityId })
      .eq("id", user.id);

    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast(`Now supporting ${charityName}!`, "success");
      fetchData();
    }
  };

  // User Action: Submit Golf Score
  const handleAddScoreSubmit = async (e) => {
    e.preventDefault();
    setAddErrorMessage("");
    setAddDuplicateScoreId(null);

    const scoreVal = parseInt(scoreValue, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      setAddErrorMessage("Stableford score must be strictly between 1 and 45.");
      return;
    }

    if (!scoreDate) {
      setAddErrorMessage("Please select a valid date.");
      return;
    }

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreValue: scoreVal, scoreDate })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "duplicate_date") {
          setAddErrorMessage(data.message);
          setAddDuplicateScoreId(data.existingScoreId);
        } else {
          setAddErrorMessage(data.message || data.error || "Failed to log score.");
        }
        return;
      }

      triggerToast("Golf score logged successfully!", "success");
      setScoreValue("");
      setShowAddScoreModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAddErrorMessage("Server connection error.");
    }
  };

  // User Action: Edit Golf Score
  const handleEditScoreSubmit = async (e) => {
    e.preventDefault();
    setEditErrorMessage("");
    setEditDuplicateScoreId(null);

    if (!editingScore) return;

    const scoreVal = parseInt(editScoreValue, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      setEditErrorMessage("Stableford score must be strictly between 1 and 45.");
      return;
    }

    try {
      const response = await fetch("/api/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingScore.id, scoreValue: scoreVal, scoreDate: editScoreDate })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "duplicate_date") {
          setEditErrorMessage(data.message);
          setEditDuplicateScoreId(data.existingScoreId);
        } else {
          setEditErrorMessage(data.message || data.error || "Failed to update score.");
        }
        return;
      }

      triggerToast("Golf score updated successfully!", "success");
      setEditingScore(null);
      setShowEditScoreModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setEditErrorMessage("Server connection error.");
    }
  };

  // User Action: Delete Golf Score
  const handleDeleteScore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this score card?")) return;

    try {
      const response = await fetch(`/api/scores?id=${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        triggerToast("Score deleted successfully.");
        fetchData();
      } else {
        const data = await response.json();
        triggerToast(data.message || "Failed to delete score.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error.", "error");
    }
  };

  // User Action: Submit winner proof screenshot (FormData upload)
  const handleProofUpload = async (e, winnerId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setUploadingProof(winnerId);

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      triggerToast("Please upload an image file (JPEG, PNG, GIF, or WEBP)", "error");
      setUploadingProof(null);
      return;
    }

    if (file.size < 1024) {
      triggerToast("File is too small to be a valid image", "error");
      setUploadingProof(null);
      return;
    }

    if (file.size > 5242880) { // 5MB
      triggerToast("File size must not exceed 5MB", "error");
      setUploadingProof(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("winnerId", winnerId);
      formData.append("file", file);

      const response = await fetch("/api/winners/proof-upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || "Upload failed. Please try again", "error");
        return;
      }

      triggerToast("Proof uploaded successfully! Awaiting admin verification.", "success");
      fetchData();
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    } finally {
      setUploadingProof(null);
      e.target.value = "";
    }
  };

  // User Action: Save General Settings (Name, Charity, and Contribution Percentage)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (editContributionPercentage < 10) {
      triggerToast("Charity contribution percentage cannot be less than 10%", "error");
      return;
    }
    setSavingSettings(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editName,
        charity_id: editCharityId || null,
        charity_contribution_percentage: editContributionPercentage
      })
      .eq("id", user.id);

    setSavingSettings(false);
    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast("Profile settings updated successfully!", "success");
      fetchData();
    }
  };

  // Open Score Edit modal
  const openEditModal = (scoreObj) => {
    setEditingScore(scoreObj);
    setEditScoreValue(scoreObj.score_value.toString());
    setEditScoreDate(scoreObj.score_date);
    setEditErrorMessage("");
    setEditDuplicateScoreId(null);
    setShowEditScoreModal(true);
  };

  // ============================================================
  // ADMIN PANEL SUB-ACTIONS
  // ============================================================

  // Admin User: Change role
  const handleAdminChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "subscriber" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", userId, role: newRole })
      });
      if (res.ok) {
        triggerToast(`Updated user role to ${newRole}`);
        fetchAdminData();
      } else {
        const d = await res.json();
        triggerToast(d.error || "Failed to update role", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin User: Toggle subscription status
  const handleAdminToggleSubscription = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "lapsed" : "active";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_subscription", userId, subStatus: nextStatus })
      });
      if (res.ok) {
        triggerToast(`Subscription set to ${nextStatus}`);
        fetchAdminData();
      } else {
        const d = await res.json();
        triggerToast(d.error || "Failed to update subscription", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin User: Delete user score
  const handleAdminDeleteScore = async (scoreId) => {
    if (!window.confirm("Delete this user's score row?")) return;
    try {
      const res = await fetch(`/api/admin/users?scoreId=${scoreId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        triggerToast("User score deleted successfully.");
        fetchAdminData();
        // Refresh local view if matching user
        if (selectedUserScores) {
          setSelectedUserScores(prev => ({
            ...prev,
            scores: prev.scores.filter(s => s.id !== scoreId)
          }));
        }
      } else {
        const d = await res.json();
        triggerToast(d.error || "Failed to delete score", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin User: Update score value/date (manual score correction)
  const handleAdminUpdateScore = async (scoreId) => {
    const val = parseInt(editingUserScoreValue, 10);
    if (isNaN(val) || val < 1 || val > 45) {
      triggerToast("Stableford score must be strictly between 1 and 45.", "error");
      return;
    }
    if (!editingUserScoreDate) {
      triggerToast("Please select a valid date.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_score",
          scoreId,
          scoreValue: val,
          scoreDate: editingUserScoreDate
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("User score corrected successfully!");
        setEditingUserScoreId(null);
        fetchAdminData();
        // Refresh local view if matching user
        if (selectedUserScores) {
          setSelectedUserScores(prev => ({
            ...prev,
            scores: prev.scores.map(s => s.id === scoreId ? { ...s, score_value: val, score_date: editingUserScoreDate } : s)
          }));
        }
      } else {
        triggerToast(data.error || "Failed to correct score", "error");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin Charity: Save/update upcoming events JSONB array
  const handleAdminSaveCharityEvents = async (charityId, updatedEvents) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("charities")
      .update({ upcoming_events: updatedEvents })
      .eq("id", charityId);

    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast("Charity events updated successfully!");
      fetchAdminData();
      fetchData(); // refresh user side draws list
      // update local editing state
      if (editingEventsCharity && editingEventsCharity.id === charityId) {
        setEditingEventsCharity(prev => ({ ...prev, upcoming_events: updatedEvents }));
      }
    }
  };

  // Admin Charity: Spotlight Toggle
  const handleAdminToggleFeaturedCharity = async (charityId, currentFeatured) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("charities")
      .update({ is_featured: !currentFeatured })
      .eq("id", charityId);

    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast("Charity spotlight toggled successfully!");
      fetchAdminData();
      fetchData();
    }
  };

  // Admin User: Add Charity
  const handleAdminAddCharity = async (e) => {
    e.preventDefault();
    if (!newCharityName || !newCharityDesc) {
      alert("Name and description are required.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("charities").insert({
      name: newCharityName,
      description: newCharityDesc,
      image_urls: newCharityImg ? [newCharityImg] : [],
      is_featured: newCharityFeatured
    });

    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast(`Added charity partner "${newCharityName}"!`);
      setNewCharityName("");
      setNewCharityDesc("");
      setNewCharityImg("");
      setNewCharityFeatured(false);
      setShowAddCharityModal(false);
      fetchAdminData();
      fetchData();
    }
  };

  // Admin User: Delete Charity
  const handleAdminDeleteCharity = async (charityId) => {
    if (!window.confirm("Are you sure you want to delete this charity partner? All users connected will be unset.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("charities").delete().eq("id", charityId);
    if (error) {
      triggerToast(error.message, "error");
    } else {
      triggerToast("Charity deleted successfully.");
      fetchAdminData();
      fetchData();
    }
  };

  // Admin Action: Approve Winner Claim
  const handleApproveWinner = async (winnerId) => {
    if (!window.confirm("Approve this winner claim?")) return;
    try {
      const res = await fetch("/api/winners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: "approve" })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Winner claim approved successfully!");
        fetchAdminData();
        fetchData();
      } else {
        triggerToast(data.error || "Failed to approve claim", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin Action: Reject Winner Claim
  const handleRejectWinner = async (winnerId, reason) => {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      triggerToast("Rejection reason must be at least 10 characters", "error");
      return;
    }
    try {
      const res = await fetch("/api/winners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: "reject", rejectionReason: trimmedReason })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Winner claim rejected successfully.");
        setShowRejectModal(false);
        setVerifyingWinner(null);
        setRejectionReason("");
        fetchAdminData();
        fetchData();
      } else {
        triggerToast(data.error || "Failed to reject claim", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin Action: Mark Payout as Paid
  const handleAdminWinnerPay = async (winnerId) => {
    if (!window.confirm("Mark this winner payout as paid?")) return;
    try {
      const res = await fetch("/api/winners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, action: "pay" })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Payout marked as paid successfully.");
        fetchAdminData();
        fetchData();
      } else {
        triggerToast(data.error || "Failed to mark as paid", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin User: Create a draft draw
  const handleCreateDrawDraft = async () => {
    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: drawMonth, year: drawYear, logicType: drawLogic })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Draft draw initialized successfully!");
        fetchDrawDetails();
        fetchAdminData();
      } else {
        triggerToast(data.error || "Failed to initialize draw", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin User: Save selected draw logic strategy
  const handleUpdateDrawStrategy = async () => {
    if (!selectedDraw) return;
    try {
      const res = await fetch("/api/admin/draws", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: selectedDraw.id, logicType: drawLogic })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Draw strategy updated successfully!");
        fetchDrawDetails();
        fetchAdminData();
      } else {
        triggerToast(data.error || "Failed to update strategy", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  // Admin User: Simulate and Calculate Draws logic (backend API call)
  const handleRunSimulation = async () => {
    if (!selectedDraw) return;
    setDrawSimulating(true);
    try {
      const res = await fetch("/api/admin/draws/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: selectedDraw.id })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Simulation executed successfully!");
        // Immediately update UI from API response — don't wait for a re-fetch
        setSimulationResults(data.simulation || null);
        setSelectedDraw(prev => prev ? { ...prev, status: "simulated" } : prev);
        // Also refresh in background for full consistency
        fetchDrawDetails();
        fetchAdminData();
      } else {
        triggerToast(data.error || "Failed to run simulation", "error");
        console.error("[Simulate Error]", data.error);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    } finally {
      setDrawSimulating(false);
    }
  };

  // Admin User: Publish simulated draw results (backend API call)
  const handlePublishDraw = async () => {
    if (!selectedDraw || !simulationResults) return;
    if (!window.confirm("Are you sure you want to PUBLISH this draw? This will lock in the winning numbers and write live winner claims. This action is ONE-WAY and cannot be undone!")) return;
    
    try {
      const res = await fetch("/api/admin/draws/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: selectedDraw.id, simulationId: simulationResults.id })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast("Draw published successfully! Winning claims are active.", "success");
        fetchDrawDetails();
        fetchAdminData();
        fetchData(); // refresh user side draws list
      } else {
        triggerToast(data.error || "Failed to publish draw", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Server connection error", "error");
    }
  };

  const userEmail = user?.email || "";
  const activeCharity = profile?.charities;
  const userRole = profile?.role || "subscriber";

  return (
    <div className="h-screen bg-[#181818] text-[#e4e4e7] flex flex-col font-sans select-none overflow-hidden">
      
      {/* ── TOAST MESSAGES ── */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 z-50 animate-fadeInUp ${
          toastType === "error" 
            ? "bg-red-500/10 border-red-500/25 text-red-400" 
            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
        }`}>
          {toastType === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-[12.5px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── TOP NAV BAR (Supabase-Style Breadcrumb & Apple Island search shell) ── */}
      <header className="h-[46px] bg-[#111111] border-b border-[#222] flex items-center px-4 justify-between sticky top-0 z-40 text-white shrink-0">
        <div className="flex items-center gap-2">
          {/* CauseLoop Logo */}
          <Link href="/" className="flex items-center gap-2 mr-3 group">
            <Logo size={18} />
          </Link>

        </div>

        {/* Right Nav Options with original search bar and hover profile menus */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 hover:text-white bg-[#1e1e1e] border border-[#2e2e2e] px-2.5 py-0.5 rounded cursor-pointer transition-all">
            Feedback
          </span>

          {/* Apple Floating Island Search Box (Hover Effect) */}
          <div 
            onClick={() => setShowSearchModal(true)}
            className="h-[24px] px-2.5 border border-[#2e2e2e] bg-[#141414] text-zinc-500 rounded flex items-center gap-3 text-[11.5px] cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/40 transition-all group"
          >
            <Search size={11} className="group-hover:text-zinc-300 transition-colors" />
            <span className="group-hover:text-zinc-300 transition-colors">Search...</span>
            <span className="text-[9px] bg-[#1a1a1c] px-1 rounded border border-[#2e2e2e] font-mono group-hover:border-zinc-600 transition-colors">Ctrl K</span>
          </div>

          <HelpCircle size={15} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
          <Bell size={15} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />

          {/* User Profile Gradient Dropdown (Hover Popover) */}
          <div className="relative group cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5227FF] to-purple-600 border border-zinc-700 flex items-center justify-center font-bold text-white text-[10px] select-none shadow-sm">
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111111] ${
              subscription?.status === "active" ? "bg-[#3ecf8e]" : "bg-zinc-500"
            }`} />
            
            {/* Hover Popover */}
            <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-[#2e2e2e] rounded-lg shadow-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-4 py-2 border-b border-zinc-900">
                <p className="text-[10px] text-zinc-500 truncate font-mono">Signed in as</p>
                <p className="text-[12px] font-semibold text-white truncate mt-0.5">{userEmail}</p>
              </div>
              {subscription?.status === "active" ? (
                <a
                  href="/api/portal"
                  className="w-full text-left px-4 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2 border-b border-zinc-900/50"
                >
                  <CreditCard size={12} className="text-[#3ecf8e]" />
                  Manage Billing
                </a>
              ) : (
                <Link
                  href="/subscribe"
                  className="w-full text-left px-4 py-2 text-[12px] text-indigo-400 hover:text-indigo-300 hover:bg-zinc-900 transition-colors flex items-center gap-2 border-b border-zinc-900/50 font-bold"
                >
                  <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                  Upgrade to Pro
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ── LEFT SIDEBAR (Original Supabase structure: Settings & Logout at bottom) ── */}
        <aside className="w-[46px] bg-[#111111] border-r border-[#222] flex flex-col justify-between items-center py-4 shrink-0 z-30 overflow-hidden select-none">
          <div className="flex flex-col gap-1.5 w-full items-center">
            
            {/* User Profile Avatar Popover at top of sidebar */}
            <div className="relative group cursor-pointer w-full flex justify-center pb-3 border-b border-[#222] mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5227FF] to-purple-600 border border-zinc-700 flex items-center justify-center font-bold text-white text-[11px] select-none shadow-sm transition-transform hover:scale-105">
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </div>
              <div className={`absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full border border-[#111111] ${
                subscription?.status === "active" ? "bg-[#3ecf8e]" : "bg-zinc-500"
              }`} />
              
              {/* Popover on Hover (opens to the right) */}
              <div className="absolute left-12 top-0 w-52 bg-[#141414]/95 border border-[#2e2e2e] rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 backdrop-blur-md">
                <div className="px-4 py-2 border-b border-zinc-900">
                  <p className="text-[10px] text-zinc-500 truncate font-mono">Signed in as</p>
                  <p className="text-[12px] font-semibold text-white truncate mt-0.5">{userEmail}</p>
                </div>
                <div className="py-1">
                  {subscription?.status === "active" ? (
                    <a
                      href="/api/portal"
                      className="w-full text-left px-4 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors flex items-center gap-2"
                    >
                      <CreditCard size={12} className="text-[#3ecf8e]" />
                      Manage Billing
                    </a>
                  ) : (
                    <Link
                      href="/subscribe"
                      className="w-full text-left px-4 py-2 text-[12px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-colors flex items-center gap-2 font-bold"
                    >
                      <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                      Upgrade to Pro
                    </Link>
                  )}
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full text-left px-4 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors flex items-center gap-2"
                  >
                    <Settings size={12} className="text-zinc-400" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors flex items-center gap-2 border-t border-zinc-900/50 mt-1"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "scores", label: "My Scores", icon: Table },
              { id: "charity", label: "My Charity", icon: Heart },
              { id: "draws_winnings", label: "Draws & Winnings", icon: Trophy },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-9 h-9 rounded flex items-center justify-center relative group transition-all ${
                    isActive
                      ? "text-[#3ecf8e] bg-[#1d2c25]"
                      : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#3ecf8e] rounded" />}
                  <Icon size={16} />
                  <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Admin console tabs separated by divider */}
            {userRole === "admin" && (
              <>
                <div className="w-6 border-t border-zinc-800 my-2 shrink-0" />
                <span className="text-[9px] text-zinc-500 font-extrabold tracking-widest font-mono shrink-0 mb-1">ADM</span>
                {[
                  { id: "admin_users", label: "Users", icon: Users },
                  { id: "admin_draws", label: "Draws", icon: Trophy },
                  { id: "admin_charities", label: "Charities", icon: Heart },
                  { id: "admin_winners", label: "Winners", icon: Award },
                  { id: "admin_reports", label: "Reports", icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={item.label}
                      className={`w-9 h-9 rounded flex items-center justify-center relative group transition-all ${
                        isActive
                          ? "text-[#3ecf8e] bg-[#1d2c25]"
                          : "text-zinc-400 hover:text-emerald-400 hover:bg-[#1a1a1f]"
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#3ecf8e] rounded" />}
                      <Icon size={16} />
                      <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Bottom Settings Link (Settings button at the bottom of sidebar) */}
          <div className="flex flex-col gap-1 w-full items-center">
            <button
              onClick={() => setActiveTab("settings")}
              title="Project Settings"
              className={`w-9 h-9 rounded flex items-center justify-center relative group transition-all ${
                activeTab === "settings"
                  ? "text-[#3ecf8e] bg-[#1d2c25]"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
              }`}
            >
              {activeTab === "settings" && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#3ecf8e] rounded" />}
              <Settings size={16} />
              <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                Project Settings
              </span>
            </button>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE CONTENT ── */}
        <main className="flex-1 bg-[#111] overflow-y-auto relative">
          <div className="max-w-[960px] mx-auto px-8 py-8">

          {loading ? (
            <div className="space-y-6 animate-pulse">
              {/* Page Header Skeleton */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-72 bg-zinc-800/60 rounded"></div>
                </div>
                <div className="h-7 w-16 bg-zinc-800/40 rounded-lg"></div>
              </div>

              {/* Stat Cards Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                      <div className="h-3 w-8 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-24 bg-zinc-800 rounded"></div>
                      <div className="h-3 w-32 bg-zinc-800/60 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two Column Section Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card Skeleton */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
                  <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between items-center py-2 border-b border-zinc-900/40">
                        <div className="space-y-1">
                          <div className="h-3 w-28 bg-zinc-800 rounded"></div>
                          <div className="h-2 w-16 bg-zinc-800/50 rounded"></div>
                        </div>
                        <div className="h-3 w-10 bg-zinc-800 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card Skeleton */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
                  <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                  <div className="h-32 bg-zinc-800/30 rounded-lg flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-t-transparent border-zinc-700 rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ============================================================ */}
              {/* TAB 1: DASHBOARD OVERVIEW                                    */}
          {/* ============================================================ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeInUp">

              {/* ── Page Header ── */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[17px] font-semibold text-white tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || "Golfer"}</h1>
                  <p className="text-[12.5px] text-zinc-500 mt-0.5">Subscription, performance and charity details at a glance.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 bg-[#161616] border border-[#222] px-2.5 py-1.5 rounded-lg">
                  <Activity size={11} className="text-[#3ecf8e]" />
                  <span>Live</span>
                </div>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Subscription Status Card */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#2a2a2a] transition-all cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-zinc-500 font-medium">Membership</span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      userRole === "admin"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : subscription?.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                    }`}>
                      {userRole === "admin" ? "Admin" : subscription?.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-white capitalize leading-none">{subscription?.plan_type || "Free Tier"}</p>
                    {subscription?.status === "active" && subscription?.current_period_end ? (
                      <p className="text-[10.5px] text-zinc-400 mt-1.5 font-mono">
                        Renews: {new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 mt-1.5">Free visitor mode</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#1e1e1e]">
                    {subscription?.status === "active" ? (
                      <a href="/api/portal" className="text-[11px] text-[#3ecf8e] hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium">
                        Stripe Billing Portal <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link href="/subscribe" className="text-[11px] text-[#3ecf8e] hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors">
                        Upgrade <Sparkles size={9} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. Latest Score */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#2a2a2a] transition-all cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-zinc-500 font-medium">Latest Score</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase tracking-wider">Stableford</span>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-white leading-none">
                      {scores.length > 0 ? scores[0].score_value : "—"}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1.5">{scores.length} of 5 rounds logged</p>
                  </div>
                  <div className="pt-2 border-t border-[#1e1e1e]">
                    <button onClick={() => setActiveTab("scores")} className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
                      View scorecard <ChevronRight size={10} />
                    </button>
                  </div>
                </div>

                {/* 3. Draw Entry */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#2a2a2a] transition-all cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-zinc-500 font-medium">Draw Entry</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase tracking-wider">Monthly</span>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-white leading-none">{scores.length > 0 ? "1" : "0"}</p>
                    <p className="text-[11px] text-zinc-500 mt-1.5">{scores.length > 0 ? "Ticket active · Jul 2026" : "Log scores to enter"}</p>
                  </div>
                  <div className="pt-2 border-t border-[#1e1e1e]">
                    <button onClick={() => setActiveTab("draws_winnings")} className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                      View draw pool <ChevronRight size={10} />
                    </button>
                  </div>
                </div>

                {/* 4. Winnings */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#2a2a2a] transition-all cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] text-zinc-500 font-medium">Winnings</span>
                    {winners.length > 0 && (
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Won</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-emerald-400 leading-none">
                      £{winners.reduce((acc, w) => acc + (w.draws?.prize_pool_amount ? 120.00 : 0.00), 0.00).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1.5">{winners.length} claim{winners.length !== 1 ? "s" : ""} detected</p>
                  </div>
                  <div className="pt-2 border-t border-[#1e1e1e]">
                    <button onClick={() => setActiveTab("draws_winnings")} className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                      View claims <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Quick Glance Panel ── */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Charity Summary Card */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
                      <Heart size={14} className="text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-white">Selected Charity Partner</h3>
                      {activeCharity ? (
                        <div className="mt-1.5">
                          <p className="text-[12.5px] font-bold text-zinc-300">{activeCharity.name}</p>
                          <p className="text-[11.5px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{activeCharity.description}</p>
                          <p className="text-[11px] text-rose-400 mt-2 font-semibold">Allocating {sliderValue}% of subscription fee</p>
                        </div>
                      ) : (
                        <p className="text-[12px] text-zinc-500 italic mt-1">No charity selected yet. Visit the My Charity tab to select a cause.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("charity")}
                    className="w-full h-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[11.5px] font-semibold text-zinc-200 hover:text-white rounded-lg transition-all"
                  >
                    Configure Donation
                  </button>
                </div>

                {/* Participation Summary Card */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                      <Trophy size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-white">Upcoming Draw Eligibility</h3>
                      {scores.length > 0 ? (
                        <div className="mt-1.5 space-y-1.5">
                          <p className="text-[12.5px] text-zinc-300">
                            Ticket status: <span className="text-[#3ecf8e] font-bold">Eligible</span>
                          </p>
                          <p className="text-[11.5px] text-zinc-500 leading-relaxed">
                            Your played numbers: <span className="font-mono text-emerald-400">{scores.map(s => s.score_value).join(", ")}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-[12px] text-zinc-500 italic mt-1 leading-relaxed">Log at least one round in My Scores to register your ticket numbers and enter upcoming draws.</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("scores")}
                    className="w-full h-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[11.5px] font-semibold text-zinc-200 hover:text-white rounded-lg transition-all"
                  >
                    Manage Scores
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GOLF SCORECARD                                        */}
          {/* ============================================================ */}
          {activeTab === "scores" && (
            <div className="space-y-5 animate-fadeInUp">

              {/* ── Header ── */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[17px] font-semibold text-white tracking-tight">Golf Scorecard</h1>
                  <p className="text-[12.5px] text-zinc-500 mt-0.5">Stableford format · rolling 5-score window · most recent first</p>
                </div>
                <button
                  id="log-round-btn"
                  onClick={() => {
                    setAddErrorMessage("");
                    setAddDuplicateScoreId(null);
                    setScoreValue("");
                    setScoreDate("");
                    setShowAddScoreModal(true);
                  }}
                  className="h-8 px-3 bg-[#3ecf8e] hover:bg-[#32b37a] text-black text-[12px] font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} strokeWidth={2.5} /> Log Round
                </button>
              </div>

              {/* ── Score Stats Row ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Rounds Logged",
                    value: `${scores.length} / 5`,
                    sub: scores.length === 5 ? "Rolling limit reached" : `${5 - scores.length} slots remaining`,
                    accent: scores.length === 5 ? "text-amber-400" : "text-[#3ecf8e]"
                  },
                  {
                    label: "Best Score",
                    value: scores.length > 0 ? Math.max(...scores.map(s => s.score_value)) : "—",
                    sub: "Highest Stableford pts",
                    accent: "text-emerald-400"
                  },
                  {
                    label: "Average Score",
                    value: scores.length > 0 ? (scores.reduce((a, s) => a + s.score_value, 0) / scores.length).toFixed(1) : "—",
                    sub: "Across logged rounds",
                    accent: "text-indigo-400"
                  },
                  {
                    label: "Latest Round",
                    value: scores.length > 0 ? scores[0].score_value : "—",
                    sub: scores.length > 0 ? new Date(scores[0].score_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No rounds yet",
                    accent: "text-white"
                  }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-1.5 hover:border-[#2a2a2a] transition-all">
                    <span className="text-[10.5px] text-zinc-500 font-medium">{stat.label}</span>
                    <p className={`text-[22px] font-bold leading-none ${stat.accent}`}>{stat.value}</p>
                    <p className="text-[11px] text-zinc-600">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Rolling Limit Warning ── */}
              {scores.length === 5 && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-400 leading-relaxed">
                    <span className="font-semibold">Rolling limit active.</span> Submitting a new score will automatically delete your oldest round&nbsp;
                    <span className="font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {scores[scores.length - 1]?.score_date}
                    </span>{" "}
                    ({scores[scores.length - 1]?.score_value} pts) to keep the window at 5 entries.
                  </p>
                </div>
              )}

              {/* ── Scorecard Table ── */}
              <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl overflow-hidden">

                {/* Table Header */}
                <div className="grid grid-cols-[48px_1fr_1fr_1fr_auto] px-5 py-2.5 border-b border-[#1e1e1e] bg-[#111] text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                  <span className="text-center">#</span>
                  <span>Score</span>
                  <span>Performance</span>
                  <span>Date Played</span>
                  <span>Actions</span>
                </div>

                {/* Table Body */}
                {scores.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-16 px-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#252525] flex items-center justify-center">
                      <Table size={20} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-white">No rounds logged yet</p>
                      <p className="text-[12px] text-zinc-500 mt-1 max-w-[260px] mx-auto">
                        Log your first Stableford score to start tracking performance and enter monthly prize draws.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAddErrorMessage("");
                        setAddDuplicateScoreId(null);
                        setScoreValue("");
                        setScoreDate("");
                        setShowAddScoreModal(true);
                      }}
                      className="h-8 px-4 bg-[#3ecf8e] hover:bg-[#32b37a] text-black text-[12px] font-bold rounded-lg transition-all"
                    >
                      Log first round
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1e1e1e]">
                    {scores.map((s, index) => {
                      const pts = s.score_value;
                      const tier =
                        pts >= 36 ? { label: "Excellent", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" } :
                        pts >= 28 ? { label: "Great", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" } :
                        pts >= 18 ? { label: "Good", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" } :
                                    { label: "Below avg", color: "text-zinc-400 bg-zinc-800 border-zinc-700/50" };
                      const isOldest = index === scores.length - 1 && scores.length === 5;

                      return (
                        <div
                          key={s.id}
                          id={`score-row-${s.id}`}
                          className={`grid grid-cols-[48px_1fr_1fr_1fr_auto] items-center px-5 py-3.5 hover:bg-[#1a1a1a] transition-colors ${isOldest ? "border-l-2 border-amber-500/40" : ""}`}
                        >
                          <span className="text-[11px] text-zinc-600 font-mono text-center font-bold">{index + 1}</span>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-[14px] font-bold ${tier.color}`}>
                              {pts}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono">pts</span>
                          </div>
                          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border w-fit ${tier.color}`}>
                            {tier.label}
                          </span>
                          <span className="text-[12.5px] text-zinc-400">
                            {new Date(s.score_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            {isOldest && (
                              <span className="ml-2 text-[9.5px] text-amber-500/80 font-semibold uppercase tracking-wider">oldest</span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(s)}
                              className="h-7 px-2.5 text-[11px] font-medium text-zinc-400 hover:text-white border border-[#272727] hover:border-[#333] rounded-lg transition-all flex items-center gap-1"
                            >
                              <Edit size={11} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteScore(s.id)}
                              className="h-7 px-2.5 text-[11px] font-medium text-red-400/70 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {scores.length > 0 && (
                  <div className="px-5 py-2.5 border-t border-[#1e1e1e] bg-[#111] flex items-center justify-between text-[11px] text-zinc-600">
                    <span>{scores.length} of 5 rounds stored · sorted newest first</span>
                    <span className="font-mono">Rolling 5-score window</span>
                  </div>
                )}
              </div>

              {/* ── Add Round Modal ── */}
              {showAddScoreModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowAddScoreModal(false)}>
                  <div className="bg-[#161616] border border-[#252525] rounded-2xl max-w-[420px] w-full shadow-2xl animate-scaleUp overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/15 flex items-center justify-center">
                          <Plus size={14} className="text-[#3ecf8e]" />
                        </div>
                        <div>
                          <h3 className="text-[13.5px] font-semibold text-white">Log Golf Round</h3>
                          <p className="text-[11px] text-zinc-500">Stableford score · 1–45 range</p>
                        </div>
                      </div>
                      <button onClick={() => setShowAddScoreModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#222] transition-all text-[18px] leading-none">×</button>
                    </div>
                    {addErrorMessage && (
                      <div className="mx-6 mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                        <div className="flex items-start gap-2">
                          <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-red-300 font-medium leading-relaxed">{addErrorMessage}</p>
                            {addDuplicateScoreId && (
                              <button
                                type="button"
                                onClick={() => {
                                  const existing = scores.find(s => s.id === addDuplicateScoreId);
                                  if (existing) { setShowAddScoreModal(false); openEditModal(existing); }
                                }}
                                className="mt-2 w-full py-1.5 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2e2e2e] text-[11.5px] text-zinc-200 font-medium rounded-lg transition-all text-center"
                              >
                                → Edit existing score for this date
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleAddScoreSubmit} className="px-6 py-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-medium text-zinc-400">Stableford Points</label>
                          {scoreValue !== "" && (
                            parseInt(scoreValue, 10) >= 1 && parseInt(scoreValue, 10) <= 45
                              ? <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 size={11} /> Valid</span>
                              : <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1"><XCircle size={11} /> Must be 1–45</span>
                          )}
                        </div>
                        <input
                          id="add-score-value"
                          type="number"
                          required
                          min="1"
                          max="45"
                          placeholder="e.g. 36"
                          value={scoreValue}
                          onChange={(e) => { setScoreValue(e.target.value); setAddErrorMessage(""); setAddDuplicateScoreId(null); }}
                          className="w-full h-9 px-3 bg-[#111] border border-[#252525] focus:border-[#3ecf8e] rounded-lg text-[13px] text-white focus:outline-none transition-colors"
                        />
                        <p className="text-[10.5px] text-zinc-600">Strictly between 1 and 45 (Stableford format)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-400 block">Date of Play</label>
                        <input
                          id="add-score-date"
                          type="date"
                          required
                          value={scoreDate}
                          onChange={(e) => { setScoreDate(e.target.value); setAddErrorMessage(""); setAddDuplicateScoreId(null); }}
                          className="w-full h-9 px-3 bg-[#111] border border-[#252525] focus:border-[#3ecf8e] rounded-lg text-[13px] text-white focus:outline-none transition-colors"
                        />
                      </div>
                      {scores.length >= 5 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <AlertCircle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-400 leading-relaxed">
                            Your oldest round <span className="font-mono text-amber-300">({scores[scores.length - 1]?.score_date} · {scores[scores.length - 1]?.score_value} pts)</span> will be removed to make room.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setShowAddScoreModal(false)} className="flex-1 h-9 border border-[#252525] hover:border-[#333] rounded-lg text-[12px] text-zinc-400 hover:text-white transition-all">Cancel</button>
                        <button type="submit" className="flex-1 h-9 bg-[#3ecf8e] hover:bg-[#32b37a] text-black font-bold rounded-lg text-[12px] transition-all">Log Round</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── Edit Round Modal ── */}
              {showEditScoreModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowEditScoreModal(false)}>
                  <div className="bg-[#161616] border border-[#252525] rounded-2xl max-w-[420px] w-full shadow-2xl animate-scaleUp overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
                          <Edit size={13} className="text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-[13.5px] font-semibold text-white">Edit Golf Round</h3>
                          <p className="text-[11px] text-zinc-500">Update score or play date</p>
                        </div>
                      </div>
                      <button onClick={() => { setShowEditScoreModal(false); setEditingScore(null); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#222] transition-all text-[18px] leading-none">×</button>
                    </div>
                    {editErrorMessage && (
                      <div className="mx-6 mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                        <div className="flex items-start gap-2">
                          <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-red-300 font-medium leading-relaxed">{editErrorMessage}</p>
                            {editDuplicateScoreId && (
                              <button
                                type="button"
                                onClick={() => {
                                  const existing = scores.find(s => s.id === editDuplicateScoreId);
                                  if (existing) { setShowEditScoreModal(false); openEditModal(existing); }
                                }}
                                className="mt-2 w-full py-1.5 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2e2e2e] text-[11.5px] text-zinc-200 font-medium rounded-lg transition-all text-center"
                              >
                                → Switch to editing that score instead
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleEditScoreSubmit} className="px-6 py-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-medium text-zinc-400">Stableford Points</label>
                          {editScoreValue !== "" && (
                            parseInt(editScoreValue, 10) >= 1 && parseInt(editScoreValue, 10) <= 45
                              ? <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 size={11} /> Valid</span>
                              : <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1"><XCircle size={11} /> Must be 1–45</span>
                          )}
                        </div>
                        <input
                          id="edit-score-value"
                          type="number"
                          required
                          min="1"
                          max="45"
                          placeholder="e.g. 36"
                          value={editScoreValue}
                          onChange={(e) => { setEditScoreValue(e.target.value); setEditErrorMessage(""); setEditDuplicateScoreId(null); }}
                          className="w-full h-9 px-3 bg-[#111] border border-[#252525] focus:border-[#3ecf8e] rounded-lg text-[13px] text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-zinc-400 block">Date of Play</label>
                        <input
                          id="edit-score-date"
                          type="date"
                          required
                          value={editScoreDate}
                          onChange={(e) => { setEditScoreDate(e.target.value); setEditErrorMessage(""); setEditDuplicateScoreId(null); }}
                          className="w-full h-9 px-3 bg-[#111] border border-[#252525] focus:border-[#3ecf8e] rounded-lg text-[13px] text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => { setShowEditScoreModal(false); setEditingScore(null); }} className="flex-1 h-9 border border-[#252525] hover:border-[#333] rounded-lg text-[12px] text-zinc-400 hover:text-white transition-all">Cancel</button>
                        <button type="submit" className="flex-1 h-9 bg-[#3ecf8e] hover:bg-[#32b37a] text-black font-bold rounded-lg text-[12px] transition-all">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}

          {/* TAB 3: CHARITIES DIRECTORY                                   */}
          {/* ============================================================ */}
          {activeTab === "charity" && (
            <div className="space-y-6 animate-fadeInUp">
              
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                  My Charity Partner
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Configure your monthly donation share and switch partner causes.</p>
              </div>

              {/* Current Selection & Slider */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Active Partner Info */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[9.5px] text-rose-400 font-bold uppercase tracking-widest block">Supported Partner</span>
                    {activeCharity ? (
                      <div className="flex items-start gap-3.5 mt-2.5">
                        {activeCharity.image_urls && activeCharity.image_urls.length > 0 ? (
                          <img
                            src={activeCharity.image_urls[0]}
                            alt={activeCharity.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#222] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
                            <Heart size={16} className="text-rose-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-white leading-tight">{activeCharity.name}</h4>
                          <p className="text-[11.5px] text-zinc-500 mt-1 leading-relaxed line-clamp-3">{activeCharity.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-zinc-950/40 border border-[#222] rounded-lg text-center py-8">
                        <Heart size={24} className="text-zinc-600 mx-auto mb-2" />
                        <p className="text-[12px] text-zinc-400 italic">No charity selected yet. Select a cause below.</p>
                      </div>
                    )}
                  </div>
                  {activeCharity && (
                    <button
                      onClick={() => {
                        const target = document.getElementById("browse-charities-section");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="h-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[11.5px] font-semibold text-zinc-200 hover:text-white rounded-lg transition-all"
                    >
                      Switch Charities Entirely
                    </button>
                  )}
                </div>

                {/* Donation Share Slider */}
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-zinc-300">Donation Share percentage</span>
                      <span className="text-[13.5px] font-bold text-rose-400 bg-rose-500/8 border border-rose-500/15 px-2 py-0.5 rounded-md font-mono">{sliderValue}%</span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        style={{
                          "--slider-pct": ((sliderValue - 10) / 90) * 100,
                          background: `linear-gradient(to right, #f43f5e ${((sliderValue - 10) / 90) * 100}%, #3f3f46 ${((sliderValue - 10) / 90) * 100}%)`
                        }}
                        className="w-full h-[3.5px] rounded-full appearance-none cursor-pointer accent-rose-500 transition-none"
                      />
                      <div className="flex justify-between text-[9.5px] text-zinc-600 font-mono">
                        <span>10% (Min)</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/4 border border-rose-500/8 rounded-lg">
                    <AlertCircle size={12} className="text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {subscription?.status === "active" ? (
                        <>You are contributing <span className="text-white font-semibold">£{((12.00 * sliderValue) / 100).toFixed(2)}</span> monthly to help {activeCharity?.name || "your selected cause"}.</>
                      ) : (
                        <>Upgrade to Pro to automate monthly fee slice allocations (10% minimum split constraint enforced).</>  
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directory Section */}
              <div id="browse-charities-section" className="space-y-4 pt-4 border-t border-[#222]">
                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Browse Charity Partners Directory</h3>
                
                {/* Search Bar / Filter Tags */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search charities by name or cause description..."
                      value={charitySearch}
                      onChange={(e) => setCharitySearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 bg-[#141414] border border-[#222] rounded text-[12.5px] text-white focus:outline-none focus:border-[#3ecf8e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["All", "Featured", "Environment", "Humanitarian", "Wellbeing"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedCharityCategory(tag)}
                        className={`px-3 py-1 rounded text-[11px] font-bold transition-all border ${
                          selectedCharityCategory === tag
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                            : "bg-[#141414] border-[#222] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Charities Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {charities
                    .filter((c) => {
                      const matchesSearch = c.name.toLowerCase().includes(charitySearch.toLowerCase()) || 
                                            c.description.toLowerCase().includes(charitySearch.toLowerCase());
                      const matchesCategory = selectedCharityCategory === "All" ||
                                              (selectedCharityCategory === "Featured" && c.is_featured) ||
                                              (selectedCharityCategory === "Environment" && c.name.toLowerCase().includes("green")) ||
                                              (selectedCharityCategory === "Humanitarian" && c.name.toLowerCase().includes("red")) ||
                                              (selectedCharityCategory === "Wellbeing" && c.name.toLowerCase().includes("mental"));
                      return matchesSearch && matchesCategory;
                    })
                    .map((c) => {
                      const isSupported = profile?.charity_id === c.id;

                      return (
                        <div key={c.id} className={`bg-[#141414] border rounded-lg p-5 flex flex-col justify-between hover:border-zinc-800 transition-colors shadow-lg relative overflow-hidden group ${
                          isSupported ? "border-rose-500/25" : "border-[#222]"
                        }`}>
                          
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              {c.image_urls && c.image_urls.length > 0 ? (
                                <img 
                                  src={c.image_urls[0]} 
                                  alt={c.name} 
                                  className="w-12 h-12 rounded object-cover border border-[#222] shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center text-rose-500 shrink-0">
                                  <Heart size={20} />
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-[14px] font-bold text-white leading-tight">{c.name}</h3>
                                  {c.is_featured && (
                                    <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.1 rounded font-extrabold uppercase tracking-wide">
                                      Spotlight
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono">ID: {c.id.substring(0, 8)}...</span>
                              </div>
                            </div>

                            <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">{c.description}</p>
                            
                            {/* Upcoming Events */}
                            {c.upcoming_events && c.upcoming_events.length > 0 && (
                              <div className="bg-zinc-950/40 p-3 rounded border border-[#222] space-y-1.5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Upcoming Events</span>
                                {c.upcoming_events.map((ev, i) => (
                                  <div key={i} className="flex justify-between text-[11px] items-center">
                                    <span className="text-zinc-300 font-semibold truncate max-w-[180px]">{ev.name}</span>
                                    <span className="text-zinc-500 font-mono">{ev.date}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CTA Row */}
                          <div className="pt-4 border-t border-[#222] mt-4 flex items-center justify-between">
                            <span className="text-[11px] text-zinc-500">
                              Raised: <span className="font-bold text-emerald-400">£1,420</span>
                            </span>
                            
                            {isSupported ? (
                              <button 
                                disabled
                                className="h-7.5 px-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded cursor-default flex items-center gap-1"
                              >
                                <Check size={11} strokeWidth={3} /> Selected Partner
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSupportCharity(c.id, c.name)}
                                className="h-7.5 px-3 bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11px] font-bold rounded transition-all"
                              >
                                Support Cause
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: DRAWS & WINNINGS                                      */}
          {/* ============================================================ */}
          {activeTab === "draws_winnings" && (
            <div className="space-y-6 animate-fadeInUp">
              
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Trophy size={18} className="text-[#3ecf8e]" />
                  Draws & Winnings Center
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Review active draw entry cards, historic draw results, and verified claim payouts.</p>
              </div>

              {/* Pool split detail banner */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { tier: "5-Number Match (Jackpot)", share: "40%", rollover: "Yes", desc: "Split equally among all 5-match winners. Jackpot rolls forward if unclaimed." },
                  { tier: "4-Number Match", share: "35%", rollover: "No", desc: "Split equally among all 4-match winners. Resets monthly." },
                  { tier: "3-Number Match", share: "25%", rollover: "No", desc: "Split equally among all 3-match winners. Resets monthly." }
                ].map((tier, idx) => (
                  <div key={idx} className="bg-[#141414] border border-[#222] rounded-lg p-5 space-y-2">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold">{tier.tier}</span>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-[20px] font-black text-white">{tier.share}</span>
                      <span className="text-[9px] bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded text-zinc-400 font-mono">Rollover: {tier.rollover}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed pt-1.5">{tier.desc}</p>
                  </div>
                ))}
              </div>

              {/* Ticket entries card */}
              <div className="bg-[#141414] border border-[#222] rounded-lg p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">My Entry Card</span>
                  <h3 className="text-[15px] font-extrabold text-white">Played Numbers for July 2026 Draws</h3>
                  <p className="text-[12px] text-zinc-400">Your ticket numbers are derived from your latest 5 logged score cards.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {scores.length === 0 ? (
                    <div className="text-[12px] text-zinc-500 italic">No rounds logged. Log scores to create tickets!</div>
                  ) : (
                    scores.map((s) => (
                      <span 
                        key={s.id} 
                        className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center font-bold text-[13.5px] text-[#3ecf8e] shadow-inner font-mono animate-scaleUp"
                      >
                        {s.score_value}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Winnings History Card */}
              <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <Award size={12} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-white">Winnings & Claims Overview</h3>
                    <p className="text-[11px] text-zinc-500">Total won historically: <span className="text-emerald-400 font-bold">£{winners.reduce((acc, w) => acc + (w.draws?.prize_pool_amount ? 120.00 : 0.00), 0.00).toFixed(2)}</span></p>
                  </div>
                </div>
                {winners.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 italic text-[12px]">No wins detected in historical draws yet. Keep playing!</div>
                ) : (
                  <div className="divide-y divide-[#222]">
                    {winners.map((w) => (
                      <div key={w.id} className="px-5 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[12.5px] font-semibold text-white">Draw {w.draws?.month}/{w.draws?.year}</p>
                          <p className="text-[11px] text-zinc-500">
                            {w.draws?.draw_type === "three_match" ? "3-Number Match" :
                             w.draws?.draw_type === "four_match" ? "4-Number Match" :
                             w.draws?.draw_type === "five_match" ? "5-Number Match (Jackpot)" :
                             w.draws?.draw_type?.replace("_", " ")}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              w.verification_status === "approved"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : w.verification_status === "rejected"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {w.verification_status === "pending"
                                ? (w.proof_image_url ? "Awaiting Verification" : "Awaiting Upload")
                                : w.verification_status
                              }
                            </span>
                            <span className={`text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              w.payment_status === "paid"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 border-zinc-700/50 text-zinc-500"
                            }`}>{w.payment_status}</span>
                          </div>
                          {w.verification_status === "rejected" && w.rejection_reason && (
                            <p className="text-[11px] text-red-400 mt-1.5 font-sans bg-red-500/5 border border-red-500/10 p-2 rounded-lg leading-relaxed max-w-md">
                              Rejection Reason: {w.rejection_reason}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {uploadingProof === w.id ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono animate-pulse">
                              <span className="w-2.5 h-2.5 border-2 border-t-transparent border-zinc-500 rounded-full animate-spin"></span>
                              Uploading...
                            </span>
                          ) : w.verification_status !== "approved" ? (
                            <label className="inline-flex items-center gap-1.5 px-3 h-7 bg-transparent border border-[#272727] hover:border-[#333] rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer transition-all">
                              <Upload size={10} />
                              {w.proof_image_url ? "Re-upload Proof" : "Upload Score Proof"}
                              <input type="file" accept="image/*" className="hidden" disabled={!!uploadingProof} onChange={(e) => handleProofUpload(e, w.id)} />
                            </label>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                              <CheckCircle2 size={12} /> Verified Win
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Draws List */}
              <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Past Drawing Results</h3>
                
                <div className="space-y-3">
                  {draws.map((d) => (
                    <div key={d.id} className="bg-[#141414] border border-[#222] rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-zinc-800 transition-colors shadow-lg">
                      
                      <div className="space-y-1.5 text-center sm:text-left">
                        <span className="text-[9px] bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                          {d.month}/{d.year} DRAW
                        </span>
                        <h4 className="text-[14px] font-bold text-white mt-1">Pool Amount: £{d.prize_pool_amount.toLocaleString()}</h4>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 flex-wrap">
                          <span>Jackpot Rollover: £{d.jackpot_rollover_amount.toLocaleString()}</span>
                          <span>•</span>
                          <span className="capitalize font-mono text-[10px]">Engine: {d.logic_type}</span>
                        </div>
                      </div>

                      {/* Winning Balls */}
                      <div className="flex items-center gap-1.5">
                        {d.winning_numbers.map((n, i) => (
                          <span 
                            key={i} 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3ecf8e] to-emerald-700 text-black font-extrabold text-[12.5px] flex items-center justify-center shadow-md border border-emerald-500/20 font-mono"
                          >
                            {n}
                          </span>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: PROFILE & BILLING SETTINGS                            */}
          {/* ============================================================ */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeInUp max-w-[600px]">
              
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Settings size={18} className="text-zinc-400" />
                  Project Settings & Billing
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Configure workspace details, settings, and billing integrations.</p>
              </div>

              {/* Form Settings Card */}
              <div className="bg-[#141414] border border-[#222] rounded-xl p-6 space-y-6 shadow-xl">
                
                <form onSubmit={handleSaveSettings} className="space-y-4 text-[13px]">
                  <h3 className="text-[14px] font-bold text-white border-b border-[#222] pb-2">Profile Metadata</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[11.5px] font-medium text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11.5px] font-medium text-zinc-400">Email Address (Registered)</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ""}
                      className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-zinc-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11.5px] font-medium text-zinc-400">Supported Charity Partner</label>
                    <select
                      value={editCharityId}
                      onChange={(e) => setEditCharityId(e.target.value)}
                      className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e] cursor-pointer"
                    >
                      <option value="">No Charity Selected</option>
                      {charities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.is_featured ? "★" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11.5px] font-medium text-zinc-400">
                      <span>Donation Share Slice</span>
                      <span className="text-[#3ecf8e] font-bold">{editContributionPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={editContributionPercentage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setEditContributionPercentage(val >= 10 ? val : 10);
                      }}
                      className="w-full accent-[#3ecf8e] bg-zinc-950 rounded h-1.5 cursor-pointer border border-zinc-800"
                    />
                    <span className="text-[10px] text-zinc-500 block leading-normal">
                      Percentage of monthly CauseLoop fee allocated directly to the selected charity (Min 10%).
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-4 py-1.5 bg-[#3ecf8e] text-black hover:bg-[#32b37a] font-bold rounded text-[12px] transition-all disabled:opacity-50"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Settings"}
                    </button>
                  </div>
                </form>

                {/* Stripe Billing Portal Integration */}
                <div className="space-y-4 pt-6 border-t border-[#222]">
                  <h3 className="text-[14px] font-bold text-white pb-1 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-[#3ecf8e]" />
                    Gateway Subscriptions
                  </h3>
                  
                  {subscription?.status === "active" ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-[13px] font-bold text-white capitalize">Active Pro Membership ({subscription?.plan_type})</h4>
                          <p className="text-[11.5px] text-zinc-400 mt-1 leading-normal">
                            Processed via Stripe cards. Cycle renews on <span className="font-semibold text-zinc-200">{new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</span>.
                          </p>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-normal">
                        Access invoices, edit cards, or cancel subscription updates via Stripe Customer Portal.
                      </p>
                      <a
                        href="/api/portal"
                        className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-[#2e2e33] text-zinc-200 hover:text-white text-[11.5px] font-bold px-4 h-8.5 rounded transition-all"
                      >
                        Manage Billing & Cards
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-[13px] font-bold text-white">Free Visitor Tier</h4>
                          <p className="text-[11.5px] text-zinc-400 mt-1 leading-normal">
                            Activate monthly or yearly golf-draw packages to unlock the scorecard and contribution slider features.
                          </p>
                        </div>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          Inactive
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-normal">
                        Select a payment plan to connect Stripe processing.
                      </p>
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11.5px] font-bold px-4 h-8.5 rounded transition-all shadow-md"
                      >
                        Upgrade to Pro
                        <Sparkles size={11} />
                      </Link>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
                {/* ============================================================ */}
          {/* TAB 6A: ADMIN - USERS                                        */}
          {/* ============================================================ */}
          {activeTab === "admin_users" && userRole === "admin" && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Users size={20} className="text-emerald-400" />
                  Admin: User Profiles
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Review registered golfers, edit roles, adjust scores, and manage subscription statuses.</p>
              </div>

              <div className="bg-[#141414] border border-[#222] rounded-lg p-6 space-y-4 shadow-xl">
                <h3 className="text-[13px] font-bold text-white border-b border-[#222] pb-2">Registered Accounts List</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px] font-mono">
                    <thead>
                      <tr className="border-b border-[#222] text-zinc-500 font-extrabold uppercase text-[10px] tracking-wider bg-zinc-950/20">
                        <th className="py-2.5 px-3">Email / Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Subscription</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] text-zinc-300 font-medium">
                      {adminProfiles.map((p) => {
                        const subRow = p.subscriptions?.[0];
                        return (
                          <tr key={p.id} className="hover:bg-zinc-950/20">
                            <td className="py-3 px-3">
                              <p className="text-white font-sans font-bold">{p.full_name || "Unnamed Golfer"}</p>
                              <p className="text-[11px] text-zinc-500 font-mono">{p.id}</p>
                            </td>
                            <td className="py-3 px-3 capitalize font-sans">{p.role}</td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize font-sans ${
                                subRow?.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                              }`}>
                                {subRow?.status || "inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-2 font-sans">
                              <button
                                onClick={() => {
                                  setSelectedUserScores(p);
                                  setShowUserScoresModal(true);
                                }}
                                className="text-[11px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded"
                              >
                                Scores
                              </button>
                              <button
                                onClick={() => handleAdminChangeRole(p.id, p.role)}
                                className="text-[11px] font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-[#2e2e33] px-2 py-1 rounded"
                              >
                                Role
                              </button>
                              <button
                                onClick={() => handleAdminToggleSubscription(p.id, subRow?.status)}
                                className="text-[11px] font-bold text-[#8644FF] hover:text-white bg-[#8644FF]/10 border border-[#8644FF]/20 px-2 py-1 rounded"
                              >
                                Subscription
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6B: ADMIN - CHARITIES                                    */}
          {/* ============================================================ */}
          {activeTab === "admin_charities" && userRole === "admin" && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Heart size={20} className="text-[#3ecf8e]" />
                  Admin: Charity Partners Manager
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Add new charity causes, toggle Featured Spotlight status, and manage active partner details.</p>
              </div>

              <div className="bg-[#141414] border border-[#222] rounded-lg p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-[#222] pb-3">
                  <h3 className="text-[13px] font-bold text-white">Charity Partners List</h3>
                  <button
                    onClick={() => {
                      setNewCharityName("");
                      setNewCharityDesc("");
                      setNewCharityImg("");
                      setNewCharityFeatured(false);
                      setShowAddCharityModal(true);
                    }}
                    className="h-8 px-3.5 bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11.5px] font-bold rounded shadow-md transition-colors"
                  >
                    Add Charity Partner
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {adminCharities.map((c) => (
                    <div key={c.id} className="bg-zinc-950/40 border border-[#222] rounded-lg p-4 flex justify-between items-start gap-4 animate-scaleUp">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {c.image_urls && c.image_urls.length > 0 ? (
                            <img src={c.image_urls[0]} alt={c.name} className="w-8 h-8 rounded object-cover border border-[#222] shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0"><Heart size={12} /></div>
                          )}
                          <div className="truncate">
                            <h4 className="text-[13px] font-bold text-white truncate">{c.name}</h4>
                            <span className="text-[9px] text-zinc-500 font-mono block">ID: {c.id.substring(0,8)}...</span>
                          </div>
                        </div>
                        <p className="text-[11.5px] text-zinc-400 line-clamp-2 leading-relaxed">{c.description}</p>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingEventsCharity(c);
                              setNewEventName("");
                              setNewEventDate("");
                              setShowEventsModal(true);
                            }}
                            className="text-[10px] text-[#3ecf8e] hover:underline font-bold"
                          >
                            Edit Events ({c.upcoming_events?.length || 0})
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => handleAdminToggleFeaturedCharity(c.id, c.is_featured)}
                          className={`h-6.5 px-2.5 rounded text-[10px] font-bold border transition-colors ${
                            c.is_featured 
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {c.is_featured ? "Featured" : "Spotlight"}
                        </button>
                        <button
                          onClick={() => handleAdminDeleteCharity(c.id)}
                          className="h-6.5 px-2.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 text-zinc-500 hover:text-red-400 rounded text-[10px] font-bold transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6C: ADMIN - DRAWS                                        */}
          {/* ============================================================ */}
          {activeTab === "admin_draws" && userRole === "admin" && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Trophy size={20} className="text-[#3ecf8e]" />
                  Admin: Drawings Manager
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Configure drawing cadence, run sandboxed simulations, and lock live drawing results.</p>
              </div>

              <div className="bg-[#141414] border border-[#222] rounded-lg p-6 space-y-6 shadow-xl">
                <div className="border-b border-[#222] pb-3">
                  <h3 className="text-[14px] font-bold text-white">Configure & Execute Monthly Prize Draw</h3>
                  <p className="text-[11.5px] text-zinc-500 mt-1">Initialize draft draws, run sandboxed simulations, and publish final results.</p>
                </div>

                {/* Cadence Selection */}
                <div className="grid sm:grid-cols-3 gap-4 items-end bg-zinc-950/30 p-4 border border-[#222] rounded-lg">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 font-medium">Draw Month</label>
                    <select 
                      value={drawMonth} 
                      onChange={(e) => setDrawMonth(parseInt(e.target.value, 10))}
                      className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-[12px] text-white focus:outline-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 font-medium">Draw Year</label>
                    <input 
                      type="number" 
                      value={drawYear} 
                      onChange={(e) => setDrawYear(parseInt(e.target.value, 10))}
                      className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-[12px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 font-medium">Algorithm Selection</label>
                    <select 
                      value={drawLogic} 
                      onChange={(e) => setDrawLogic(e.target.value)}
                      disabled={selectedDraw?.status === "published"}
                      className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-[12px] text-white focus:outline-none disabled:opacity-50"
                    >
                      <option value="random">Random Generation (Unbiased)</option>
                      <option value="algorithmic">Algorithmic Weighted (Frequency-Based)</option>
                    </select>
                  </div>
                </div>

                {/* Draw State Information */}
                {!selectedDraw ? (
                  <div className="bg-zinc-900/30 border border-[#222] rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                        Status: Not Initialized
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-1">No draw has been configured for {drawMonth}/{drawYear} yet.</p>
                    </div>
                    <button
                      onClick={handleCreateDrawDraft}
                      className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11.5px] font-extrabold rounded shadow-md transition-colors"
                    >
                      Initialize Draft Draw
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Draw Header */}
                    <div className="bg-zinc-900/30 border border-[#222] rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h4 className="text-[13.5px] font-bold text-white flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            selectedDraw.status === "published" ? "bg-emerald-500" :
                            selectedDraw.status === "simulated" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          Status: <span className="capitalize font-mono">{selectedDraw.status}</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">Draw ID: {selectedDraw.id}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Strategy: <span className="font-mono text-zinc-300">{selectedDraw.logic_type}</span></p>
                      </div>
                      
                      <div className="flex gap-2">
                        {selectedDraw.status !== "published" && (
                          <>
                            {drawLogic !== selectedDraw.logic_type && (
                              <button
                                onClick={handleUpdateDrawStrategy}
                                className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold rounded border border-zinc-700 transition-colors"
                              >
                                Save Strategy
                              </button>
                            )}
                            <button
                              onClick={handleRunSimulation}
                              disabled={drawSimulating}
                              className="h-8 px-4 bg-emerald-500 hover:bg-emerald-400 text-black text-[11.5px] font-extrabold rounded flex items-center gap-1.5 disabled:opacity-50 shadow-md transition-colors"
                            >
                              <Play size={11} fill="currentColor" />
                              {drawSimulating ? "Simulating..." : "Run Simulation"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Simulation Result Area */}
                    {selectedDraw.status !== "published" && simulationResults && (
                      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-5 space-y-4 animate-scaleUp">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-500/10 pb-3 gap-3">
                          <div>
                            <h4 className="text-[13px] font-bold text-white">Projected Simulation Output</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Simulation ID: {simulationResults.id}</p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            {simulationResults.winning_numbers?.map((n, i) => (
                              <span key={i} className="w-8 h-8 rounded-full bg-[#3ecf8e] text-black font-extrabold text-[12px] flex items-center justify-center shadow-md">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-[11px] font-mono text-zinc-400">
                          <div>Active Subs: <span className="text-white font-bold">{adminProfiles.filter(p => p.subscriptions?.some(s => s.status === "active")).length}</span></div>
                          <div>Total Pool: <span className="text-[#3ecf8e] font-bold">£{parseFloat(simulationResults.prize_pool_amount).toFixed(2)}</span></div>
                          <div>Jackpot Rollover: <span className="text-[#3ecf8e] font-bold">£{parseFloat(simulationResults.jackpot_rollover_amount).toFixed(2)}</span></div>
                        </div>

                        {/* Projected Winners List */}
                        {simulationResults.projected_winners && simulationResults.projected_winners.filter(w => w.match_count >= 3).length > 0 ? (
                          <div className="space-y-2 pt-2">
                            <h5 className="text-[11.5px] font-bold text-white uppercase tracking-wider">Projected Winners (&ge; 3 Matches)</h5>
                            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 text-[11.5px] font-mono max-h-[160px] overflow-y-auto">
                              {simulationResults.projected_winners.filter(w => w.match_count >= 3).map((w, idx) => (
                                <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-zinc-950/30">
                                  <span>{w.full_name} (Matches: {w.match_count})</span>
                                  <span className="text-[#3ecf8e] font-bold">£{parseFloat(w.prize_amount).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11.5px] text-zinc-500 italic bg-zinc-950/20 p-3 rounded-lg border border-zinc-900">No simulated users matched 3+ numbers. The 5-match jackpot pool will roll over to the next month.</p>
                        )}

                        <div className="flex justify-end pt-2 border-t border-emerald-500/10">
                          <button
                            onClick={handlePublishDraw}
                            className="h-8 px-4 bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11.5px] font-bold rounded shadow-md transition-colors"
                          >
                            Publish Draw Results (Live)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Published State Results */}
                    {selectedDraw.status === "published" && (
                      <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-lg p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-indigo-500/10 pb-3 gap-3">
                          <div>
                            <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                              <Lock size={12} className="text-indigo-400" />
                              Locked Winning Numbers
                            </h4>
                            <p className="text-[11px] text-zinc-500 mt-0.5">This draw has been published. Results are final.</p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            {selectedDraw.winning_numbers?.map((n, i) => (
                              <span key={i} className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-[12px] flex items-center justify-center shadow-md">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-zinc-400">
                          <div>Authoritative Prize Pool: <span className="text-white font-bold">£{parseFloat(selectedDraw.prize_pool_amount).toFixed(2)}</span></div>
                          <div>Jackpot Rollover: <span className="text-indigo-400 font-bold">£{parseFloat(selectedDraw.jackpot_rollover_amount).toFixed(2)}</span></div>
                        </div>

                        {/* Actual Winners */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-[11.5px] font-bold text-white uppercase tracking-wider">Official Winners</h5>
                          {adminWinners.filter(w => w.draw_id === selectedDraw.id).length > 0 ? (
                            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950/20 text-[11.5px] font-mono max-h-[200px] overflow-y-auto">
                              {adminWinners.filter(w => w.draw_id === selectedDraw.id).map((w, idx) => {
                                const entry = adminDrawEntries.find(e => e.draw_id === w.draw_id && e.user_id === w.user_id);
                                const matches = entry ? entry.match_count : 0;
                                const prize = entry ? parseFloat(entry.prize_amount).toFixed(2) : "0.00";
                                
                                return (
                                  <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-zinc-950/30">
                                    <div>
                                      <p className="text-white font-sans font-bold">{w.profiles?.full_name || w.profiles?.email}</p>
                                      <p className="text-[10px] text-zinc-500">Matches: {matches} · Claim: {w.verification_status} · Payout: {w.payment_status}</p>
                                    </div>
                                    <span className="text-indigo-400 font-bold">£{prize}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11.5px] text-zinc-500 italic bg-zinc-950/20 p-3 rounded-lg border border-zinc-900">No winners for this draw period. Rollover applied.</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6D: ADMIN - WINNERS                                      */}
          {/* ============================================================ */}
          {activeTab === "admin_winners" && userRole === "admin" && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Award size={20} className="text-[#3ecf8e]" />
                  Admin: Winner Claims & Payouts
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Review uploaded score proof screenshots, verify claim eligibility, and track payout statuses.</p>
              </div>

              {/* Filters Box */}
              <div className="flex gap-3 bg-zinc-950/30 p-4 border border-[#222] rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-medium">Claim Status</label>
                  <select 
                    value={claimVerificationFilter} 
                    onChange={(e) => setClaimVerificationFilter(e.target.value)}
                    className="h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-[12px] text-white focus:outline-none"
                  >
                    <option value="all">All Claims</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-medium">Payout Status</label>
                  <select 
                    value={claimPaymentFilter} 
                    onChange={(e) => setClaimPaymentFilter(e.target.value)}
                    className="h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-[12px] text-white focus:outline-none"
                  >
                    <option value="all">All Payouts</option>
                    <option value="pending">Pending Payment</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Submitted Claims List */}
              <div className="bg-[#141414] border border-[#222] rounded-lg p-6 space-y-4 shadow-xl">
                <h3 className="text-[13px] font-bold text-white border-b border-[#222] pb-2">Review Submitted Claims</h3>

                <div className="divide-y divide-[#222] border border-[#222] rounded-lg overflow-hidden font-sans">
                  {adminWinners.filter((w) => {
                    const matchesVerify = claimVerificationFilter === "all" || w.verification_status === claimVerificationFilter;
                    const matchesPay = claimPaymentFilter === "all" || w.payment_status === claimPaymentFilter;
                    return matchesVerify && matchesPay;
                  }).length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic text-[12px]">No winner claims match the filters.</div>
                  ) : (
                    adminWinners.filter((w) => {
                      const matchesVerify = claimVerificationFilter === "all" || w.verification_status === claimVerificationFilter;
                      const matchesPay = claimPaymentFilter === "all" || w.payment_status === claimPaymentFilter;
                      return matchesVerify && matchesPay;
                    }).map((w) => (
                      <div key={w.id} className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className="text-[13px] font-bold text-white">{w.profiles?.full_name || w.profiles?.email}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {w.id.substring(0, 8)}...</span>
                          </div>
                          
                          <p className="text-[11.5px] text-zinc-400">
                            Draw Month/Year: <span className="font-mono text-zinc-300 font-bold">{w.draws?.month}/{w.draws?.year}</span> · 
                            Prize: <span className="text-emerald-400 font-bold">
                              {w.draws?.draw_type === "three_match" ? "3-Number Match" : 
                               w.draws?.draw_type === "four_match" ? "4-Number Match" : "5-Number Match (Jackpot)"}
                            </span>
                          </p>

                          <div className="flex gap-2">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              w.verification_status === "approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                              w.verification_status === "rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              Claim: {w.verification_status}
                            </span>
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              w.payment_status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700/50 text-zinc-500"
                            }`}>
                              Payout: {w.payment_status}
                            </span>
                          </div>

                          {w.verification_status === "rejected" && w.rejection_reason && (
                            <p className="text-[12px] text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded-lg max-w-lg leading-relaxed">
                              Rejection Reason: {w.rejection_reason}
                            </p>
                          )}

                          {w.proof_image_url ? (
                            <div className="pt-2">
                              <p className="text-[9.5px] text-zinc-500 uppercase tracking-widest font-black pb-1.5">Score Proof (Click to Zoom):</p>
                              <button 
                                onClick={() => setAdminProofModal(w.proof_image_url)}
                                className="relative group text-left cursor-zoom-in block"
                                title="Click to zoom proof"
                              >
                                <img 
                                  src={w.proof_image_url} 
                                  alt="Proof" 
                                  className="max-w-[240px] rounded border border-[#222] shadow-lg object-contain max-h-[140px] group-hover:opacity-85 transition-opacity bg-zinc-950"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                  <span className="text-[10px] bg-zinc-900/90 text-white px-2.5 py-1 rounded font-bold border border-zinc-855 shadow-lg font-sans">Zoom Proof</span>
                                </div>
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-zinc-500 italic pt-1">No screenshot proof uploaded.</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 self-center">
                          {w.verification_status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveWinner(w.id)}
                                className="h-8 px-4 bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11px] font-bold rounded shadow-md transition-colors"
                              >
                                Approve Claim
                              </button>
                              <button
                                onClick={() => {
                                  setVerifyingWinner(w.id);
                                  setRejectionReason("");
                                  setShowRejectModal(true);
                                }}
                                className="h-8 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-bold rounded transition-colors"
                              >
                                Reject Claim
                              </button>
                            </>
                          )}

                          {w.verification_status === "approved" && w.payment_status === "pending" && (
                            <button
                              onClick={() => handleAdminWinnerPay(w.id)}
                              className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11.5px] font-bold rounded shadow-md transition-colors"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6E: ADMIN - REPORTS                                      */}
          {/* ============================================================ */}
          {activeTab === "admin_reports" && userRole === "admin" && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#3ecf8e]" />
                  Admin: Reports & Analytics
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Review user registration growth, prize distribution, and charity supporters.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Registered Users", val: adminProfiles.length, icon: Users, color: "text-indigo-400" },
                  { label: "Total Accumulated Pools", val: `£${(adminDraws.reduce((acc, d) => acc + d.prize_pool_amount, 0.00)).toFixed(2)}`, icon: DollarSign, color: "text-emerald-400" },
                  { label: "Total Charity Funding", val: `£${(adminProfiles.reduce((acc, p) => acc + (p.subscriptions?.some(s => s.status === 'active') ? 1.20 : 0.00), 0.00)).toFixed(2)}`, icon: Heart, color: "text-rose-500" }
                ].map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={i} className="bg-[#141414] border border-[#222] rounded-xl p-5 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-[22px] font-black ${stat.color}`}>{stat.val}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                        <StatIcon size={18} className={stat.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recharts Visualizations */}
              {isMounted && (
                <div className="grid md:grid-cols-2 gap-6 font-sans">
                  {/* Chart 1: User Growth */}
                  <div className="bg-[#141414] border border-[#222] rounded-xl p-5 space-y-4 shadow-xl">
                    <div>
                      <h3 className="text-[13px] font-bold text-white uppercase tracking-wider font-sans">User Registration Growth</h3>
                      <p className="text-[11.5px] text-zinc-500 mt-0.5 font-sans">Total accounts created over time</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getChartUserData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                          <YAxis stroke="#555" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "#141414", borderColor: "#222", borderRadius: 8, fontSize: 11 }} labelClassName="text-white font-bold font-sans" />
                          <Area type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#userGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Charity Supporters */}
                  <div className="bg-[#141414] border border-[#222] rounded-xl p-5 space-y-4 shadow-xl">
                    <div>
                      <h3 className="text-[13px] font-bold text-white uppercase tracking-wider font-sans">Charity Partner Supporters</h3>
                      <p className="text-[11.5px] text-zinc-500 mt-0.5 font-sans">Active golfer counts supporting each cause</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartCharityData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                          <YAxis stroke="#555" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "#141414", borderColor: "#222", borderRadius: 8, fontSize: 11 }} labelClassName="text-white font-bold font-sans" />
                          <Bar dataKey="Supporters" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            </>
          )}

          </div>
        </main>
      </div>

      {/* Admin Modal: Edit User Scores */}
      {showUserScoresModal && selectedUserScores && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl max-w-[440px] w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b border-[#222] pb-2 font-sans">
              <div>
                <h3 className="text-[15px] font-bold text-white">Scores: {selectedUserScores.full_name || selectedUserScores.email}</h3>
                <p className="text-[12px] text-zinc-400">Review or delete rounds logged for this profile.</p>
              </div>
              <button 
                onClick={() => {
                  setShowUserScoresModal(false);
                  setSelectedUserScores(null);
                }}
                className="text-zinc-500 hover:text-white text-[20px] font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto font-mono text-[12px]">
              {(selectedUserScores.scores || []).length === 0 ? (
                <p className="text-center py-6 text-zinc-500 italic font-sans text-[12.5px]">No scores logged for this user.</p>
              ) : (
                selectedUserScores.scores.map((sc) => (
                  <div key={sc.id} className="flex justify-between items-center p-3 bg-zinc-950/60 border border-[#222] rounded-lg">
                    <div>
                      <p className="font-bold text-white font-mono">Points: {sc.score_value}</p>
                      <p className="text-[11px] text-zinc-500 font-sans">Date: {sc.score_date}</p>
                    </div>
                    <button
                      onClick={() => handleAdminDeleteScore(sc.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal: Add Charity */}
      {showAddCharityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl max-w-[400px] w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b border-[#222] pb-2 font-sans">
              <div>
                <h3 className="text-[15px] font-bold text-white">Add Charity Partner</h3>
                <p className="text-[12px] text-zinc-400">Configure partner details.</p>
              </div>
              <button 
                onClick={() => setShowAddCharityModal(false)}
                className="text-zinc-500 hover:text-white text-[20px] font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdminAddCharity} className="space-y-4 text-[12.5px] font-sans">
              <div className="space-y-1">
                <label className="font-medium text-zinc-400">Charity Name</label>
                <input
                  type="text"
                  required
                  value={newCharityName}
                  onChange={(e) => setNewCharityName(e.target.value)}
                  placeholder="e.g. Save the Children"
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-400">Description</label>
                <textarea
                  required
                  value={newCharityDesc}
                  onChange={(e) => setNewCharityDesc(e.target.value)}
                  placeholder="Mission details..."
                  className="w-full h-16 p-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-400">Logo Image URL</label>
                <input
                  type="text"
                  value={newCharityImg}
                  onChange={(e) => setNewCharityImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#3ecf8e]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newCharityFeatured}
                  onChange={(e) => setNewCharityFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#3ecf8e] rounded bg-zinc-950 border-zinc-800"
                />
                <label htmlFor="featured" className="font-medium text-zinc-300">Spotlight featured partner</label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCharityModal(false)}
                  className="px-4 py-1.5 border border-zinc-800 rounded text-[12px] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3ecf8e] text-black font-bold rounded text-[12px]"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal: Edit Charity Events */}
      {showEventsModal && editingEventsCharity && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl max-w-[440px] w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b border-[#222] pb-2 font-sans">
              <div>
                <h3 className="text-[15px] font-bold text-white">Events: {editingEventsCharity.name}</h3>
                <p className="text-[12px] text-zinc-400 font-sans">Manage upcoming campaigns or events.</p>
              </div>
              <button 
                onClick={() => {
                  setShowEventsModal(false);
                  setEditingEventsCharity(null);
                }}
                className="text-zinc-500 hover:text-white text-[20px] font-bold leading-none font-sans"
              >
                &times;
              </button>
            </div>

            {/* Event list */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto text-[11.5px] font-mono">
              {(!editingEventsCharity.upcoming_events || editingEventsCharity.upcoming_events.length === 0) ? (
                <p className="text-center py-4 text-zinc-500 italic font-sans text-[12px]">No events configured.</p>
              ) : (
                editingEventsCharity.upcoming_events.map((ev, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-zinc-950/60 border border-[#222] rounded-lg">
                    <div className="truncate pr-2">
                      <p className="font-bold text-white font-sans truncate">{ev.name}</p>
                      <p className="text-[10px] text-zinc-500 font-sans">{ev.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingEventsCharity.upcoming_events.filter((_, i) => i !== idx);
                        setEditingEventsCharity(prev => ({ ...prev, upcoming_events: updated }));
                      }}
                      className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 rounded transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Event Form */}
            <div className="space-y-3 pt-2 border-t border-[#222] font-sans">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block font-sans">Add Event</span>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium font-sans">Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Gala"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium font-sans">Event Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 Aug 2026"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#3ecf8e]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newEventName.trim() || !newEventDate.trim()) {
                    triggerToast("Please fill in both event name and date.", "error");
                    return;
                  }
                  const newEv = { name: newEventName.trim(), date: newEventDate.trim() };
                  const updated = [...(editingEventsCharity.upcoming_events || []), newEv];
                  setEditingEventsCharity(prev => ({ ...prev, upcoming_events: updated }));
                  setNewEventName("");
                  setNewEventDate("");
                }}
                className="w-full h-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold rounded text-[11px] transition-all"
              >
                Add Event to List
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex gap-2 justify-end pt-2 border-t border-[#222] font-sans">
              <button
                type="button"
                onClick={() => {
                  setShowEventsModal(false);
                  setEditingEventsCharity(null);
                }}
                className="px-4 py-1.5 border border-zinc-800 rounded text-[12px] text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdminSaveCharityEvents(editingEventsCharity.id, editingEventsCharity.upcoming_events);
                  setShowEventsModal(false);
                }}
                className="px-4 py-1.5 bg-[#3ecf8e] text-black font-bold rounded text-[12px]"
              >
                Save All Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal: Reject Winner Claim */}
      {showRejectModal && verifyingWinner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/20 rounded-xl max-w-[420px] w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b border-[#222] pb-2 font-sans">
              <div>
                <h3 className="text-[15px] font-bold text-white">Reject Winner Claim</h3>
                <p className="text-[12px] text-zinc-400">Specify the reason for rejecting this score proof.</p>
              </div>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setVerifyingWinner(null);
                  setRejectionReason("");
                }}
                className="text-zinc-500 hover:text-white text-[20px] font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 font-sans">
              <label className="text-[12px] text-zinc-400 font-medium">Rejection Reason (10 - 1000 characters)</label>
              <textarea
                required
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the proof was rejected (e.g. score mismatch, wrong date)..."
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-[12.5px] focus:outline-none focus:border-red-500 resize-none font-sans"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Min: 10 chars · Max: 1000 chars</span>
                <span className={rejectionReason.trim().length >= 10 ? "text-[#3ecf8e]" : "text-red-400"}>
                  {rejectionReason.trim().length} characters
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-[#222] font-sans">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setVerifyingWinner(null);
                  setRejectionReason("");
                }}
                className="px-4 py-1.5 border border-zinc-800 rounded text-[12px] text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectionReason.trim().length < 10 || rejectionReason.trim().length > 1000}
                onClick={() => handleRejectWinner(verifyingWinner, rejectionReason)}
                className="px-4 py-1.5 bg-red-650 text-white font-bold rounded text-[12px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Viewer Modal */}
      {adminProofModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setAdminProofModal(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center gap-4 animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAdminProofModal(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white flex items-center gap-1.5 text-[12px] font-bold bg-zinc-900/80 border border-zinc-850 px-3 py-1.5 rounded-lg shadow-lg hover:border-zinc-700 transition-colors font-sans"
            >
              Close Fullscreen
            </button>
            <img 
              src={adminProofModal} 
              alt="Proof Fullsize" 
              className="max-h-[80vh] w-auto max-w-full rounded-xl border border-zinc-800 shadow-2xl object-contain bg-zinc-950"
            />
          </div>
        </div>
      )}

      {/* Subscription Confirming Backdrop */}
      {verifyingSubscription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-indigo-500/20 rounded-xl max-w-[400px] w-full p-8 text-center space-y-6 shadow-2xl animate-fadeInUp">
            <div className="relative mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <div className="absolute inset-0 rounded-xl border border-dashed border-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              <Logo size={20} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[16px] font-bold text-white tracking-tight">Confirming Subscription</h3>
              <p className="text-[12px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Securing your payment session with Stripe. This takes just a moment to verify...
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Awaiting Webhook Signals</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#3ecf8e]/35 rounded-xl max-w-[400px] w-full p-8 text-center space-y-6 shadow-2xl animate-fadeInUp">
            <div className="mx-auto w-12 h-12 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-full flex items-center justify-center text-[#3ecf8e]">
              <Check size={24} strokeWidth={3} className="animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[18px] font-bold text-white tracking-tight">Welcome to CauseLoop Pro!</h3>
              <p className="text-[12.5px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Thank you for subscribing! Your membership has been upgraded to Pro successfully.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#3ecf8e] text-black hover:bg-[#32b37a] font-bold py-2 rounded-lg text-[13px] transition-all"
            >
              Go to My Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Subscription Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-500/20 rounded-xl max-w-[400px] w-full p-8 text-center space-y-6 shadow-2xl animate-fadeInUp">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
              <HelpCircle size={24} strokeWidth={2} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[17px] font-bold text-white tracking-tight">Payment Confirmation Pending</h3>
              <p className="text-[12.5px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Stripe is taking a bit longer to confirm the payment session. Your account will upgrade automatically as soon as it clears.
              </p>
            </div>

            <button
              onClick={() => setShowPendingModal(false)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white font-bold py-2 rounded-lg text-[13px] transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ─── Apple spotlight style command search modal ─── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fadeIn" onClick={() => setShowSearchModal(false)}>
          <div 
            className="bg-[#141414]/95 border border-[#2e2e2e] rounded-2xl w-full max-w-[550px] shadow-2xl overflow-hidden backdrop-blur-xl animate-scaleUp flex flex-col max-h-[60vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#222]">
              <Search className="text-zinc-500 shrink-0" size={16} />
              <input
                type="text"
                autoFocus
                placeholder="Search commands, navigate or take actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-transparent border-0 text-white placeholder-zinc-500 focus:ring-0 focus:outline-none text-[13px] font-sans"
              />
              <span className="text-[9px] bg-[#1a1a1c] px-1.5 py-0.5 rounded border border-[#2e2e2e] font-mono text-zinc-500">ESC</span>
            </div>

            {/* Command List Results */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredSearchItems.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-zinc-500 italic font-sans">
                  No commands found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                Object.entries(
                  filteredSearchItems.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category} className="space-y-0.5">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest px-3 py-1 font-sans">
                      {category}
                    </div>
                    {items.map((item) => {
                      const flatIndex = filteredSearchItems.findIndex(x => x.id === item.id);
                      const isSelected = flatIndex === searchSelectedIndex;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSearchSelectedIndex(flatIndex)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e]" 
                              : "text-zinc-400 hover:bg-[#1a1a1f] border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={14} className={isSelected ? "text-[#3ecf8e]" : "text-zinc-500"} />
                            <span className="text-[12.5px] font-medium font-sans">{item.label}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] bg-[#3ecf8e]/20 text-[#3ecf8e] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                              ↵ Enter
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer help */}
            <div className="bg-[#111113] border-t border-[#222] px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span>↑↓ navigate</span>
                <span>•</span>
                <span>↵ select</span>
              </span>
              <span>Spotlight Command</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
