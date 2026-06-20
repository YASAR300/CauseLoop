const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envVars[match[1].trim()] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required to seed the database.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_CHARITIES = [
  {
    name: "Golf for Good",
    description: "Introducing underprivileged youth to golf, providing premium equipment, training, and life-skills mentorship.",
    image_urls: [
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400"
    ],
    upcoming_events: [
      { name: "Charity Golf Scramble 2026", date: "2026-07-15", location: "St Andrews Links" },
      { name: "Youth Golf Clinic", date: "2026-08-01", location: "Belfry Golf Resort" }
    ],
    is_featured: true
  },
  {
    name: "British Red Cross",
    description: "Providing vital humanitarian aid and emergency response to people in crisis in the UK and overseas.",
    image_urls: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400"
    ],
    upcoming_events: [
      { name: "Disaster Preparedness Webinar", date: "2026-07-20", location: "Online" }
    ],
    is_featured: false
  },
  {
    name: "Green Fairways Foundation",
    description: "Transforming golf courses into ecological havens, preserving local wetlands, and planting trees to offset turf emissions.",
    image_urls: [
      "https://images.unsplash.com/photo-1593111548525-4729c87ee8d4?auto=format&fit=crop&q=80&w=400"
    ],
    upcoming_events: [
      { name: "Eco-Fairway Tree Planting Day", date: "2026-07-28", location: "Wentworth Club" }
    ],
    is_featured: false
  },
  {
    name: "Mental Health UK",
    description: "Offering support, advice, and counseling services for anyone struggling with mental health issues across the UK.",
    image_urls: [
      "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=400"
    ],
    upcoming_events: [
      { name: "Mindful Golf Walk", date: "2026-07-10", location: "Celtic Manor" }
    ],
    is_featured: false
  }
];

const SEED_DRAWS = [
  {
    month: 5,
    year: 2026,
    draw_type: "five_match",
    logic_type: "random",
    status: "published",
    winning_numbers: [12, 24, 35, 41, 45],
    prize_pool_amount: 12500.00,
    jackpot_rollover_amount: 5000.00
  },
  {
    month: 6,
    year: 2026,
    draw_type: "five_match",
    logic_type: "random",
    status: "published",
    winning_numbers: [5, 15, 23, 38, 42],
    prize_pool_amount: 15000.00,
    jackpot_rollover_amount: 7500.00
  },
  {
    month: 7,
    year: 2026,
    draw_type: "five_match",
    logic_type: "algorithmic",
    status: "simulated",
    winning_numbers: [3, 11, 28, 30, 44],
    prize_pool_amount: 18200.00,
    jackpot_rollover_amount: 12000.00
  }
];

async function seed() {
  console.log("Seeding database tables...");
  
  try {
    // 1. Seed Charities
    const { data: existingCharities } = await supabase.from('charities').select('id, name');
    if (!existingCharities || existingCharities.length === 0) {
      console.log("Inserting charities...");
      const { data, error } = await supabase.from('charities').insert(SEED_CHARITIES).select();
      if (error) {
        console.error("Error inserting charities:", error);
      } else {
        console.log(`Inserted ${data.length} charities successfully.`);
      }
    } else {
      console.log("Charities already seeded. Count:", existingCharities.length);
    }

    // 2. Seed Draws
    const { data: existingDraws } = await supabase.from('draws').select('id, month, year');
    if (!existingDraws || existingDraws.length === 0) {
      console.log("Inserting draws...");
      const { data, error } = await supabase.from('draws').insert(SEED_DRAWS).select();
      if (error) {
        console.error("Error inserting draws:", error);
      } else {
        console.log(`Inserted ${data.length} draws successfully.`);
      }
    } else {
      console.log("Draws already seeded. Count:", existingDraws.length);
    }

    console.log("Seed script execution completed!");
  } catch (err) {
    console.error("Unhandled error seeding:", err);
  }
}

seed();
