import pool from './config/db.js';

async function seedDatabase() {
  console.log('⏳ Starting database seeding with high-quality test data...');
  
  try {
    // 1. Disable Foreign Key Constraints to truncate cleanly
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE hostel_photos');
    await pool.query('TRUNCATE TABLE hostels');
    await pool.query('TRUNCATE TABLE room_photos');
    await pool.query('TRUNCATE TABLE rooms');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️ Successfully cleared existing Hostels and Rooms database entries.');

    // 2. Generate 15 Realistic Hostels for SRKR / Bhimavaram Area
    const hostelsData = [
      {
        hostel_name: 'Sri Venkateswara Boys Hostel',
        gender: 'boys',
        price_starting: 4200.00,
        is_ac: 0,
        beds_per_room: 4,
        phone: '9848022338',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Chinna Amiram, Bhimavaram (Opposite SRKR Side Gate)',
        facilities_json: JSON.stringify(["WiFi", "Food", "Laundry", "Bike Parking", "RO Water"]),
        rules_json: JSON.stringify(["Gate closes at 10:30 PM", "No alcohol allowed", "Maintain cleanliness"]),
        sponsor_order: 1,
        is_college_hostel: 0,
        available_beds: 15,
        total_beds: 60
      },
      {
        hostel_name: 'Sri Gayatri Girls Hostel',
        gender: 'girls',
        price_starting: 5200.00,
        is_ac: 1,
        beds_per_room: 3,
        phone: '9440511223',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Mavullamma Temple Street, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "CCTV Security", "24/7 Hot Water", "Power Backup"]),
        rules_json: JSON.stringify(["Strict gate closing at 9:00 PM", "No visitors allowed in rooms", "ID card mandatory"]),
        sponsor_order: 2,
        is_college_hostel: 0,
        available_beds: 8,
        total_beds: 45
      },
      {
        hostel_name: 'Elite Boys Luxury PG & Hostel',
        gender: 'boys',
        price_starting: 6500.00,
        is_ac: 1,
        beds_per_room: 2,
        phone: '8919055443',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Near SRKR Main Road, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Gym Room", "AC Rooms", "Attached Washrooms", "Laundry"]),
        rules_json: JSON.stringify(["No Smoking", "Loud music not allowed after 10 PM", "Eco friendly use of power"]),
        sponsor_order: 3,
        is_college_hostel: 0,
        available_beds: 6,
        total_beds: 30
      },
      {
        hostel_name: 'Saraswathi Ladies Hostel',
        gender: 'girls',
        price_starting: 4800.00,
        is_ac: 0,
        beds_per_room: 4,
        phone: '9949988776',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Chinna Amiram Main Road, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "RO Water", "Washing Machine", "Secured Wardens"]),
        rules_json: JSON.stringify(["Gate closes at 9:15 PM", "Prior permission needed for outings", "Quiet hours after 10:00 PM"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 12,
        total_beds: 40
      },
      {
        hostel_name: 'SRKR Campus Boys Hostel (Block-A)',
        gender: 'boys',
        price_starting: 3800.00,
        is_ac: 0,
        beds_per_room: 4,
        phone: '9000123456',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'SRKR College Campus, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Playground Access", "Library Room", "Purified Water"]),
        rules_json: JSON.stringify(["College rules apply", "Ragging strictly prohibited", "Attendance marking at 9:30 PM"]),
        sponsor_order: 0,
        is_college_hostel: 1,
        available_beds: 35,
        total_beds: 120
      },
      {
        hostel_name: 'Durga Bhavani Girls Hostel',
        gender: 'girls',
        price_starting: 4000.00,
        is_ac: 0,
        beds_per_room: 5,
        phone: '9849200112',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Near Juvvalapalem Road, Bhimavaram',
        facilities_json: JSON.stringify(["Food", "WiFi", "Filtered Water", "Secured Compound Gate"]),
        rules_json: JSON.stringify(["Gate closes at 9:00 PM", "No self cooking allowed", "Keep common areas clean"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 14,
        total_beds: 50
      },
      {
        hostel_name: 'Aditya Executive Boys Hostel',
        gender: 'boys',
        price_starting: 5800.00,
        is_ac: 1,
        beds_per_room: 2,
        phone: '9550411225',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Balusumoodi Lane, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "RO Water", "AC Rooms", "Car Parking"]),
        rules_json: JSON.stringify(["No Smoking or Alcohol", "Guests allowed only in lounge", "Timely rent payment"]),
        sponsor_order: 4,
        is_college_hostel: 0,
        available_beds: 5,
        total_beds: 24
      },
      {
        hostel_name: 'Sri Sai Srinivasa Girls Hostel',
        gender: 'girls',
        price_starting: 5000.00,
        is_ac: 0,
        beds_per_room: 3,
        phone: '9121455667',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Opposite SRKR Ground Gate, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "CCTV Security", "Study Room", "Hot Water Boiler"]),
        rules_json: JSON.stringify(["Gate closes at 9:15 PM", "ID must be produced on demand", "Strictly no boy visitors"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 9,
        total_beds: 36
      },
      {
        hostel_name: 'Vijaya Lakshmi Girls PG',
        gender: 'girls',
        price_starting: 5500.00,
        is_ac: 1,
        beds_per_room: 2,
        phone: '9652511229',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Police Station Road, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "RO Water", "CCTV security", "Laundry", "Fridge Access"]),
        rules_json: JSON.stringify(["Gate closes at 9:30 PM", "Notify wardens for late arrivals", "Do not waste water/food"]),
        sponsor_order: 5,
        is_college_hostel: 0,
        available_beds: 4,
        total_beds: 20
      },
      {
        hostel_name: 'Maruti Boys PG Accommodation',
        gender: 'boys',
        price_starting: 4500.00,
        is_ac: 0,
        beds_per_room: 3,
        phone: '7799122334',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Chinna Amiram Post Office street, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Bike Parking", "24/7 Security"]),
        rules_json: ["Gate closes at 11:00 PM", "Room cleaning schedule must be followed", "Guests not allowed overnight"],
        rules_json: JSON.stringify(["Gate closes at 11:00 PM", "No overnight guests without notice"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 10,
        total_beds: 30
      },
      {
        hostel_name: 'Raghava Boys Hostel',
        gender: 'boys',
        price_starting: 3600.00,
        is_ac: 0,
        beds_per_room: 6,
        phone: '9393112233',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Taderu Road, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Parking", "Water Purifier"]),
        rules_json: JSON.stringify(["Keep noise levels low", "Rent to be paid by 5th of every month"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 22,
        total_beds: 72
      },
      {
        hostel_name: 'Krishnaveni Ladies Hostel',
        gender: 'girls',
        price_starting: 4500.00,
        is_ac: 0,
        beds_per_room: 4,
        phone: '9494300401',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'D-Mart Backside Street, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "RO Water", "CCTV Cameras", "Warden Supervision"]),
        rules_json: JSON.stringify(["Gate closes at 9:00 PM", "Switch off lights by 11:00 PM"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 11,
        total_beds: 48
      },
      {
        hostel_name: 'Bhimavaram Student Heaven PG',
        gender: 'boys',
        price_starting: 7000.00,
        is_ac: 1,
        beds_per_room: 2,
        phone: '8123456789',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Prakasam Chowk Main Road, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Premium Food", "AC", "Washing Machine", "Mini Gym Room"]),
        rules_json: JSON.stringify(["No Smoking / Alcohol", "Guests strictly prohibited inside rooms", "Quiet hours from 11 PM to 6 AM"]),
        sponsor_order: 6,
        is_college_hostel: 0,
        available_beds: 3,
        total_beds: 16
      },
      {
        hostel_name: 'Abhiram Residency Boys Hostel',
        gender: 'boys',
        price_starting: 4800.00,
        is_ac: 0,
        beds_per_room: 3,
        phone: '9553511224',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'Chinna Amiram Central Lane, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Parking", "Power Backup", "Solar Water Heaters"]),
        rules_json: JSON.stringify(["Gate closes at 10:30 PM", "Clean your own plates", "Conserve electricity"]),
        sponsor_order: 0,
        is_college_hostel: 0,
        available_beds: 8,
        total_beds: 30
      },
      {
        hostel_name: 'Srinivasa Girls College Hostel',
        gender: 'girls',
        price_starting: 4200.00,
        is_ac: 0,
        beds_per_room: 4,
        phone: '9848511226',
        google_maps_link: 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
        address: 'SRKR Girls Campus, Bhimavaram',
        facilities_json: JSON.stringify(["WiFi", "Food", "Secured Compound Wall", "Warden Guard", "Study Hall"]),
        rules_json: JSON.stringify(["Campus hostel timings apply", "Strict in-campus code of conduct", "Sign register on exit/entry"]),
        sponsor_order: 0,
        is_college_hostel: 1,
        available_beds: 25,
        total_beds: 100
      }
    ];

    // Insert Hostels and their primary & secondary photos
    for (let i = 0; i < hostelsData.length; i++) {
      const h = hostelsData[i];
      const [res] = await pool.query(
        `INSERT INTO hostels 
         (hostel_name, gender, price_starting, is_ac, beds_per_room, phone, google_maps_link, address, facilities_json, rules_json, sponsor_order, is_college_hostel, available_beds, total_beds, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [h.hostel_name, h.gender, h.price_starting, h.is_ac, h.beds_per_room, h.phone, h.google_maps_link, h.address, h.facilities_json, h.rules_json, h.sponsor_order, h.is_college_hostel, h.available_beds, h.total_beds]
      );
      
      const hostelId = res.insertId;

      // Seed mock photo paths. Unsplash fallback in UI handles rendering automatically
      await pool.query(
        'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, 1)',
        [hostelId, `Uploads/Hostels/mock-${hostelId}-primary.jpg`]
      );
      await pool.query(
        'INSERT INTO hostel_photos (hostel_id, photo, is_primary) VALUES (?, ?, 0)',
        [hostelId, `Uploads/Hostels/mock-${hostelId}-secondary.jpg`]
      );
    }
    console.log(`✨ Seeded ${hostelsData.length} Hostels with primary/secondary photo mappings successfully.`);

    // 3. Generate 25 PG & Rental Rooms for SRKR / Bhimavaram Area
    const roomsData = [
      { room_name: 'Comfort Sharing PG Rooms', gender: 'boys', price: 2800, is_ac: 0, beds: 4, filled: 6, avail: 2, total: 8, dist: 0.4 },
      { room_name: 'Anu Ladies PG & Rooms', gender: 'girls', price: 4600, is_ac: 1, beds: 2, filled: 3, avail: 1, total: 4, dist: 0.9 },
      { room_name: 'Unisex Student Comfort Rooms', gender: 'unisex', price: 2500, is_ac: 0, beds: 5, filled: 12, avail: 3, total: 15, dist: 1.5 },
      { room_name: 'Royal Stay Boys Rooms', gender: 'boys', price: 5500, is_ac: 1, beds: 3, filled: 4, avail: 5, total: 9, dist: 0.6 },
      { room_name: 'Greenview Rental Rooms for Girls', gender: 'girls', price: 6000, is_ac: 1, beds: 2, filled: 4, avail: 2, total: 6, dist: 1.1 },
      { room_name: 'Metro Student Rooms', gender: 'boys', price: 3200, is_ac: 0, beds: 3, filled: 8, avail: 4, total: 12, dist: 0.5 },
      { room_name: 'Devi Luxury PG for Girls', gender: 'girls', price: 5000, is_ac: 1, beds: 2, filled: 6, avail: 2, total: 8, dist: 0.7 },
      { room_name: 'Budget Unisex Student Stay', gender: 'unisex', price: 2000, is_ac: 0, beds: 4, filled: 16, avail: 4, total: 20, dist: 2.2 },
      { room_name: 'Sri Sai PG Single/Double Sharing', gender: 'boys', price: 4200, is_ac: 0, beds: 2, filled: 7, avail: 3, total: 10, dist: 0.3 },
      { room_name: 'Venkata Sai Rooms', gender: 'boys', price: 3000, is_ac: 0, beds: 3, filled: 5, avail: 4, total: 9, dist: 0.8 },
      { room_name: 'Sneha Ladies PG Accommodation', gender: 'girls', price: 4800, is_ac: 0, beds: 3, filled: 8, avail: 4, total: 12, dist: 1.0 },
      { room_name: 'Bhimavaram Deluxe Cozy Rooms', gender: 'unisex', price: 3500, is_ac: 0, beds: 2, filled: 5, avail: 3, total: 8, dist: 1.3 },
      { room_name: 'Nivas Boys Premium Host', gender: 'boys', price: 6200, is_ac: 1, beds: 2, filled: 3, avail: 3, total: 6, dist: 0.2 },
      { room_name: 'Swathi Girls Rental Rooms', gender: 'girls', price: 4000, is_ac: 0, beds: 4, filled: 10, avail: 2, total: 12, dist: 1.2 },
      { room_name: 'Smart Unisex Student Dorms', gender: 'unisex', price: 2300, is_ac: 0, beds: 6, filled: 14, avail: 4, total: 18, dist: 1.8 },
      { room_name: 'Sri Lakshmi Nivas PG', gender: 'girls', price: 5200, is_ac: 1, beds: 3, filled: 6, avail: 3, total: 9, dist: 0.6 },
      { room_name: 'Vikas Boys Executive Rooms', gender: 'boys', price: 5000, is_ac: 1, beds: 2, filled: 4, avail: 2, total: 6, dist: 0.8 },
      { room_name: 'Friendship PG Rooms', gender: 'boys', price: 2700, is_ac: 0, beds: 4, filled: 11, avail: 5, total: 16, dist: 1.4 },
      { room_name: 'Akshaya Girls PG & Rooms', gender: 'girls', price: 4500, is_ac: 0, beds: 3, filled: 7, avail: 2, total: 9, dist: 0.7 },
      { room_name: 'New Town Premium Rooms', gender: 'unisex', price: 6500, is_ac: 1, beds: 2, filled: 3, avail: 3, total: 6, dist: 1.0 },
      { room_name: 'Balaji Boys Student Stay', gender: 'boys', price: 3300, is_ac: 0, beds: 3, filled: 9, avail: 3, total: 12, dist: 0.5 },
      { room_name: 'Srilekha Ladies Accommodation', gender: 'girls', price: 5300, is_ac: 1, beds: 2, filled: 5, avail: 1, total: 6, dist: 0.5 },
      { room_name: 'Pavan Classic Sharing PG', gender: 'boys', price: 2900, is_ac: 0, beds: 4, filled: 7, avail: 5, total: 12, dist: 1.6 },
      { room_name: 'Sri Sai Krupa Rooms', gender: 'unisex', price: 2400, is_ac: 0, beds: 4, filled: 11, avail: 5, total: 16, dist: 2.0 },
      { room_name: 'Luxury Studio PG Rooms', gender: 'unisex', price: 7000, is_ac: 1, beds: 1, filled: 2, avail: 2, total: 4, dist: 0.4 }
    ];

    const standardFacilities = ["WiFi", "RO Water", "Bike Parking", "Geyser", "CCTV Security", "Washing Machine"];
    const standardRules = ["No Smoking", "No Alcohol", "Keep cleanliness", "Gate closes at 10 PM"];

    for (let i = 0; i < roomsData.length; i++) {
      const r = roomsData[i];
      // Pick random facilities / rules
      const randFacilities = standardFacilities.filter(() => Math.random() > 0.3);
      const randRules = standardRules.filter(() => Math.random() > 0.4);

      const [res] = await pool.query(
        `INSERT INTO rooms 
         (room_name, gender, price_per_person, is_ac, beds_per_room, filled_count, available_beds, total_beds, distance_from_srkr, phone, google_maps_link, address, facilities_json, rules_json, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          r.room_name, 
          r.gender, 
          r.price, 
          r.is_ac, 
          r.beds, 
          r.filled, 
          r.avail, 
          r.total, 
          r.dist, 
          `9988${String(i).padStart(6, '0')}`,
          'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram',
          `${Math.round(r.dist * 1000)}m from SRKR College Main Campus, Bhimavaram`,
          JSON.stringify(randFacilities.length > 0 ? randFacilities : ["WiFi", "RO Water"]),
          JSON.stringify(randRules.length > 0 ? randRules : ["Keep cleanliness"])
        ]
      );

      const roomId = res.insertId;

      // Seed mock photo paths
      await pool.query(
        'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, 1)',
        [roomId, `Uploads/Rooms/mock-${roomId}-primary.jpg`]
      );
      await pool.query(
        'INSERT INTO room_photos (room_id, photo, is_primary) VALUES (?, ?, 0)',
        [roomId, `Uploads/Rooms/mock-${roomId}-secondary.jpg`]
      );
    }
    console.log(`✨ Seeded ${roomsData.length} Rooms/PGs with primary/secondary photo mappings successfully.`);

    console.log('✅ Database seeding finished successfully! All 15 hostels and 25 rooms have been populated.');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
