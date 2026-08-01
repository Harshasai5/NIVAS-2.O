import pool from './config/db.js';

const hostelsData = [
  {
    hostel_name: 'Sri Vigneswara Boys Hostel',
    phone: '8978010166',
    gender: 'boys',
    beds_per_room: '2,3,4',
    total_beds: 80,
    available_beds: 35,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "cc cameras"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box"]),
    associated_college: 'SRKR Engineering',
    address: 'Beside Masjid, SRKR Engg. college,JP Road,Bhimavaram',
    google_maps_link: 'https://maps.app.goo.gl/GQ7mn2EQ4aXG9yYo8',
    sponsor_order: 5,
    is_ac: 1,
    room_options_json: JSON.stringify(["2 sharing", "3 sharing", "4 sharing"])
  },
  {
    hostel_name: 'Vijaya Aditya Boys Hostel',
    phone: '9014998694',
    gender: 'boys',
    beds_per_room: '1,2,3,4,5',
    total_beds: 250,
    available_beds: 60,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "security", "non-veg", "lockers", "cc cameras"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box", "nyt 9 00pm gates are closed"]),
    associated_college: 'SRKR Engineering',
    address: 'oppo. to SRKR statue ,JP road',
    google_maps_link: 'https://maps.app.goo.gl/vPrzqYfej4BxHw8i9',
    sponsor_order: 6,
    is_ac: 1,
    room_options_json: JSON.stringify(["1 sharing", "2 sharing", "3 sharing", "4 sharing", "5 sharing"])
  },
  {
    hostel_name: 'Tatavarthy Boys Hostel',
    phone: '9848138064',
    gender: 'boys',
    beds_per_room: '3',
    total_beds: 92,
    available_beds: 20,
    installments: 1,
    facilities_json: JSON.stringify(["Wash machine", "Wifi", "24/7 Power supply", "security", "only veg", "cc cameras", "hygine food", "hot water"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box", "deciplaine"]),
    associated_college: 'SRKR Engineering',
    address: 'Kovada road,Undi bypass,Bhimavaram',
    google_maps_link: 'https://maps.app.goo.gl/TdNs6mZPGi8vTUR58',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify(["3 sharing"])
  },
  {
    hostel_name: '7 Hills Boys Hostel',
    phone: '9121844223',
    gender: 'boys',
    beds_per_room: '4,5,6',
    total_beds: 80,
    available_beds: 20,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "security", "non-veg", "lockers", "cc cameras", "festival speacials"]),
    rules_json: JSON.stringify(["Permission based outing"]),
    associated_college: 'SRKR Engineering',
    address: 'Beside Trends ,SRKR road,Bhimavaram',
    google_maps_link: 'https://maps.app.goo.gl/qPDDGCvqWpT2NBuk7?g_st=ac',
    sponsor_order: 0,
    is_ac: 1,
    room_options_json: JSON.stringify(["4 sharing", "5 sharing", "6 sharing"])
  },
  {
    hostel_name: 'P.V.R Girls Hostel',
    phone: '7989934888',
    gender: 'girls',
    beds_per_room: '4',
    total_beds: 150,
    available_beds: 20,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "cc cameras"]),
    rules_json: JSON.stringify(["6 30 gates closed", "After 10 30pm no food orders allowed"]),
    associated_college: 'SRKR Engineering',
    address: 'Chaitnaya jr. college,Chinamiram',
    google_maps_link: 'https://maps.app.goo.gl/htsJ1c2y1sP27EcRA',
    sponsor_order: 2,
    is_ac: 1,
    room_options_json: JSON.stringify(["4 sharing"])
  },
  {
    hostel_name: 'Sri Siva Bala Girls hostel',
    phone: '9866953455',
    gender: 'girls',
    beds_per_room: '4,5',
    total_beds: 80,
    available_beds: 10,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "cc cameras"]),
    rules_json: JSON.stringify(["gates close by 06:00Pm"]),
    associated_college: 'SRKR Engineering',
    address: 'Chaitnaya jr. college,Chinamiram',
    google_maps_link: 'https://maps.app.goo.gl/171M1tRiLW4ztPxG6',
    sponsor_order: 0,
    is_ac: 1,
    room_options_json: JSON.stringify(["4 sharing", "5 sharing"])
  },
  {
    hostel_name: 'OM SAI BOYS HOSTEL',
    phone: '9494941905',
    gender: 'boys',
    beds_per_room: '2,3,4,5,6',
    total_beds: 150,
    available_beds: 25,
    installments: 2,
    facilities_json: JSON.stringify(["Ac & non AC ROOMS", "DRINKING WATER", "HOT WATER", "LIFT", "GENERATOR", "CCTV", "FREE WASHING MACHINE FACILITY", "FREE WI-FI"]),
    rules_json: JSON.stringify(["gates close by 06:00Pm", "Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box"]),
    associated_college: 'SRKR Engineering',
    address: 'NEAR SRKR ENGINEERING COLLEGE MAIN GATE, BESIDE SEETAYYA GRAND, JP ROAD, BHIMAVARAM.',
    google_maps_link: 'https://maps.app.goo.gl/3n7GQ97wZozzy3aB7',
    sponsor_order: 1,
    is_ac: 1,
    room_options_json: JSON.stringify(["2 sharing", "3 sharing", "4 sharing", "5 sharing", "6 sharing"])
  },
  {
    hostel_name: 'SSDK Boys Hostel',
    phone: '',
    gender: 'boys',
    beds_per_room: '1',
    total_beds: 0,
    available_beds: 0,
    installments: 1,
    facilities_json: JSON.stringify([]),
    rules_json: JSON.stringify([]),
    associated_college: 'SRKR Engineering',
    address: '',
    google_maps_link: '',
    sponsor_order: 3,
    is_ac: 0,
    room_options_json: JSON.stringify([])
  },
  {
    hostel_name: 'Naresh Boys Hostel',
    phone: '',
    gender: 'boys',
    beds_per_room: '1',
    total_beds: 0,
    available_beds: 0,
    installments: 1,
    facilities_json: JSON.stringify([]),
    rules_json: JSON.stringify([]),
    associated_college: 'SRKR Engineering',
    address: '',
    google_maps_link: '',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify([])
  },
  {
    hostel_name: 'Naresh Girls Hostel',
    phone: '',
    gender: 'girls',
    beds_per_room: '1',
    total_beds: 0,
    available_beds: 0,
    installments: 1,
    facilities_json: JSON.stringify([]),
    rules_json: JSON.stringify([]),
    associated_college: 'SRKR Engineering',
    address: '',
    google_maps_link: '',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify([])
  },
  {
    hostel_name: 'Kusuma Sri Girls Hostel',
    phone: '',
    gender: 'girls',
    beds_per_room: '1',
    total_beds: 0,
    available_beds: 0,
    installments: 1,
    facilities_json: JSON.stringify([]),
    rules_json: JSON.stringify([]),
    associated_college: 'SRKR Engineering',
    address: '',
    google_maps_link: '',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify([])
  },
  {
    hostel_name: 'Mitra Boys Hostel',
    phone: '9014998694',
    gender: 'boys',
    beds_per_room: '2,3,4,5',
    total_beds: 80,
    available_beds: 30,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "security", "non-veg", "lockers", "cc cameras"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box", "nyt 9 00pm gates are closed"]),
    associated_college: 'Vishnu engineering college',
    address: 'South gate vishnu engg. college,kovada arch,tgp. road',
    google_maps_link: 'https://maps.app.goo.gl/KtA66cC5WEEKUXeT8',
    sponsor_order: 5,
    is_ac: 1,
    room_options_json: JSON.stringify(["2 sharing", "3 sharing", "4 sharing", "5 sharing"])
  },
  {
    hostel_name: 'Vijaya Aditya Girls Hostel',
    phone: '9010698831',
    gender: 'girls',
    beds_per_room: '3,4',
    total_beds: 250,
    available_beds: 30,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "security", "non-veg", "lockers", "cc cameras"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box", "nyt 8 30pm gates are closed"]),
    associated_college: 'Vishnu engineering college',
    address: 'oppo. to Vishnu main gate,tpg. road',
    google_maps_link: 'https://maps.app.goo.gl/KtA66cC5WEEKUXeT8',
    sponsor_order: 0,
    is_ac: 1,
    room_options_json: JSON.stringify(["3 sharing", "4 sharing"])
  },
  {
    hostel_name: 'Tatavarthy Boys Hostel',
    phone: '9848138064',
    gender: 'boys',
    beds_per_room: '3',
    total_beds: 92,
    available_beds: 20,
    installments: 1,
    facilities_json: JSON.stringify(["Wash machine", "Wifi", "24/7 Power supply", "security", "only veg", "cc cameras", "hygine food"]),
    rules_json: JSON.stringify(["Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box", "deciplaine"]),
    associated_college: 'Vishnu engineering college',
    address: 'Kovada road,Undi bypass,Bhimavaram',
    google_maps_link: 'https://maps.app.goo.gl/TdNs6mZPGi8vTUR58',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify(["3 sharing"])
  },
  {
    hostel_name: '7 Hills Boys Hostel',
    phone: '9121844223',
    gender: 'boys',
    beds_per_room: '4,5,6',
    total_beds: 80,
    available_beds: 20,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "security", "non-veg", "lockers", "cc cameras", "festival speacials"]),
    rules_json: JSON.stringify(["Permission based outing"]),
    associated_college: 'Vishnu engineering college',
    address: 'South Gate Vishnu engg. college,kovada arch,tpj. road',
    google_maps_link: 'https://maps.app.goo.gl/RZm37qV5BryLZozu7',
    sponsor_order: 0,
    is_ac: 1,
    room_options_json: JSON.stringify(["4 sharing", "5 sharing", "6 sharing"])
  },
  {
    hostel_name: 'Aditya Tripura Boys Hostel',
    phone: '9000917652',
    gender: 'boys',
    beds_per_room: '4,5',
    total_beds: 450,
    available_beds: 50,
    installments: 2,
    facilities_json: JSON.stringify(["AC", "Wash machine", "Wifi", "24/7 Power supply", "cc cameras"]),
    rules_json: JSON.stringify(["gates close by 10:00 pm"]),
    associated_college: 'Vishnu engineering college',
    address: 'Beside South gate Vishnu engg. college,kovada arch',
    google_maps_link: 'https://maps.app.goo.gl/N5CjfWcWfhzyXRrx9',
    sponsor_order: 1,
    is_ac: 1,
    room_options_json: JSON.stringify(["4 sharing", "5 sharing"])
  },
  {
    hostel_name: 'OM SAI BOYS HOSTEL',
    phone: '9494941905',
    gender: 'boys',
    beds_per_room: '2,3,4,5,6',
    total_beds: 150,
    available_beds: 25,
    installments: 2,
    facilities_json: JSON.stringify(["Ac & non AC ROOMS", "DRINKING WATER", "HOT WATER", "LIFT", "GENERATOR", "CCTV", "FREE WASHING MACHINE FACILITY", "FREE WI-FI"]),
    rules_json: JSON.stringify(["gates close by 06:00Pm", "Need to follow Mess timings", "No electronic Gadgets(except chargers,laptop,mobile)", "No iron box"]),
    associated_college: 'Vishnu engineering college',
    address: 'Beside South gate Vishnu engg. college,kovada arch',
    google_maps_link: 'https://maps.app.goo.gl/KgGHdvy6hDK1pX4E7',
    sponsor_order: 2,
    is_ac: 1,
    room_options_json: JSON.stringify(["2 sharing", "3 sharing", "4 sharing", "5 sharing", "6 sharing"])
  },
  {
    hostel_name: 'Naresh Boys Hostel',
    phone: '',
    gender: 'boys',
    beds_per_room: '',
    total_beds: 0,
    available_beds: 0,
    installments: 1,
    facilities_json: JSON.stringify([]),
    rules_json: JSON.stringify([]),
    associated_college: 'Vishnu engineering college',
    address: '',
    google_maps_link: '',
    sponsor_order: 0,
    is_ac: 0,
    room_options_json: JSON.stringify([])
  }
];

async function seedDatabase() {
  console.log('⏳ Starting clean database seeding with CSV data...');
  
  try {
    // 1. Disable Foreign Key Constraints to truncate cleanly
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE hostel_photos');
    await pool.query('TRUNCATE TABLE hostels');
    await pool.query('TRUNCATE TABLE room_photos');
    await pool.query('TRUNCATE TABLE rooms');
    await pool.query('TRUNCATE TABLE banners');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('TRUNCATE TABLE otp_codes');
    await pool.query('TRUNCATE TABLE user_interactions');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️ Successfully cleared all existing database entries except admin accounts.');

    // 2. Insert Hostels mapped from CSV
    for (let i = 0; i < hostelsData.length; i++) {
      const h = hostelsData[i];
      await pool.query(
        `INSERT INTO hostels 
         (hostel_name, gender, price_starting, is_ac, beds_per_room, phone, google_maps_link, address, facilities_json, rules_json, sponsor_order, is_college_hostel, available_beds, total_beds, status, installments, room_options_json, associated_college) 
         VALUES (?, ?, 5000.00, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'active', ?, ?, ?)`,
        [
          h.hostel_name, 
          h.gender, 
          h.is_ac, 
          h.beds_per_room, 
          h.phone, 
          h.google_maps_link, 
          h.address, 
          h.facilities_json, 
          h.rules_json, 
          h.sponsor_order, 
          h.available_beds, 
          h.total_beds, 
          h.installments, 
          h.room_options_json, 
          h.associated_college
        ]
      );
    }
    console.log(`✨ Successfully seeded ${hostelsData.length} Hostels from CSV.`);

  } catch (error) {
    console.error('❌ Database seeding failed with error:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
