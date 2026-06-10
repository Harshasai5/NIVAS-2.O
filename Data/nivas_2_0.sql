-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 23, 2026 at 05:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nivas_2_0`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `banner_image` varchar(255) NOT NULL,
  `redirect_link` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `in_between` tinyint(1) DEFAULT 0,
  `main_display` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `banner_image`, `redirect_link`, `display_order`, `in_between`, `main_display`, `status`, `created_at`) VALUES
(1, 'Premium Hostels Near SRKR', 'Uploads/Banners/1.png', '#', 1, 0, 1, 'active', '2026-05-23 15:18:14'),
(2, 'Affordable PG Rooms Available', 'Uploads/Banners/2.png', '#', 2, 0, 1, 'active', '2026-05-23 15:18:14'),
(3, 'AC Rooms Starting From ₹3000', 'Uploads/Banners/3.png', '#', 3, 1, 1, 'active', '2026-05-23 15:18:14'),
(4, 'Best Student Accommodation', 'Uploads/Banners/4.png', '#', 4, 1, 0, 'active', '2026-05-23 15:18:14');

-- --------------------------------------------------------

--
-- Table structure for table `hostels`
--

CREATE TABLE `hostels` (
  `id` int(11) NOT NULL,
  `hostel_name` varchar(255) NOT NULL,
  `gender` enum('boys','girls') NOT NULL,
  `price_starting` decimal(10,2) NOT NULL,
  `is_ac` tinyint(1) DEFAULT 0,
  `beds_per_room` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `google_maps_link` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `facilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`facilities_json`)),
  `rules_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`rules_json`)),
  `sponsor_order` int(11) DEFAULT 0,
  `is_college_hostel` tinyint(1) DEFAULT 0,
  `available_beds` int(11) DEFAULT 0,
  `total_beds` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `installments` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hostels`
--

INSERT INTO `hostels` (`id`, `hostel_name`, `gender`, `price_starting`, `is_ac`, `beds_per_room`, `phone`, `google_maps_link`, `address`, `facilities_json`, `rules_json`, `sponsor_order`, `available_beds`, `total_beds`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Sai Boys Hostel', 'boys', 4500.00, 1, 4, '9876543210', 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram', 'Near SRKR Engineering College, Bhimavaram, Andhra Pradesh', '[\"WiFi\",\"Food\",\"Laundry\",\"Parking\",\"Power Backup\"]', '[\"No Smoking\",\"No Loud Music\",\"Visitors Not Allowed\"]', 1, 12, 40, 'active', '2026-05-23 14:50:14', '2026-05-23 14:50:14'),
(2, 'Lakshmi Girls Hostel', 'girls', 5500.00, 1, 3, '9123456780', 'https://maps.google.com/?q=Vijayawada', 'Benz Circle, Vijayawada, Andhra Pradesh', '[\"WiFi\",\"Food\",\"CCTV\",\"Hot Water\"]', '[\"Gate closes at 9PM\",\"ID Card Mandatory\"]', 2, 8, 30, 'active', '2026-05-23 14:50:14', '2026-05-23 14:50:14'),
(3, 'Krishna Student Hostel', 'boys', 3500.00, 0, 6, '9988776655', 'https://maps.google.com/?q=Hyderabad', 'Kukatpally, Hyderabad, Telangana', '[\"WiFi\",\"Parking\"]', '[\"No Alcohol\",\"Maintain Cleanliness\"]', 0, 20, 60, 'active', '2026-05-23 14:50:14', '2026-05-23 14:50:14'),
(4, 'Green Valley Hostel', 'girls', 6000.00, 1, 2, '9000011111', 'https://maps.google.com/?q=Bangalore', 'Marathahalli, Bangalore, Karnataka', '[\"WiFi\",\"Gym\",\"Laundry\",\"Food\"]', '[\"No Late Entry\",\"Maintain Discipline\"]', 3, 5, 25, 'active', '2026-05-23 14:50:14', '2026-05-23 14:50:14'),
(5, 'Ocean View Hostel', 'boys', 4000.00, 0, 5, '9555544444', 'https://maps.google.com/?q=Visakhapatnam', 'MVP Colony, Visakhapatnam, Andhra Pradesh', '[\"Parking\",\"RO Water\",\"WiFi\"]', '[\"No Smoking\"]', 0, 18, 50, 'active', '2026-05-23 14:50:14', '2026-05-23 14:50:14');

-- --------------------------------------------------------

--
-- Table structure for table `hostel_photos`
--

CREATE TABLE `hostel_photos` (
  `id` int(11) NOT NULL,
  `hostel_id` int(11) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hostel_photos`
--

INSERT INTO `hostel_photos` (`id`, `hostel_id`, `photo`, `is_primary`, `created_at`) VALUES
(1, 1, 'Uploads/Hostels/H1.1.jpg', 1, '2026-05-23 15:17:08'),
(2, 1, 'Uploads/Hostels/H1.2.jpg', 0, '2026-05-23 15:17:08'),
(3, 2, 'Uploads/Hostels/H2.1.jpg', 1, '2026-05-23 15:17:08'),
(4, 2, 'Uploads/Hostels/H2.2.jpg', 0, '2026-05-23 15:17:08'),
(5, 2, 'Uploads/Hostels/H2.3.jpg', 0, '2026-05-23 15:17:08');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `gender` enum('boys','girls','unisex') NOT NULL,
  `price_per_person` decimal(10,2) NOT NULL,
  `is_ac` tinyint(1) DEFAULT 0,
  `beds_per_room` int(11) NOT NULL,
  `filled_count` int(11) DEFAULT 0,
  `available_beds` int(11) DEFAULT 0,
  `total_beds` int(11) DEFAULT 0,
  `distance_from_srkr` decimal(5,2) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `google_maps_link` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `facilities_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`facilities_json`)),
  `rules_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`rules_json`)),
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_name`, `gender`, `price_per_person`, `is_ac`, `beds_per_room`, `filled_count`, `available_beds`, `total_beds`, `distance_from_srkr`, `phone`, `google_maps_link`, `address`, `facilities_json`, `rules_json`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Sai PG Rooms', 'boys', 3000.00, 0, 4, 6, 2, 8, 0.50, '9012345678', 'https://maps.google.com/?q=SRKR+Engineering+College+Bhimavaram', '500m from SRKR, Bhimavaram', '[\"WiFi\",\"Bike Parking\",\"RO Water\"]', '[\"No Smoking\",\"Keep Room Clean\"]', 'active', '2026-05-23 14:50:32', '2026-05-23 14:50:32'),
(2, 'Anu Ladies PG', 'girls', 4800.00, 1, 2, 3, 1, 4, 1.20, '9090909090', 'https://maps.google.com/?q=Guntur', 'Brodipet, Guntur, Andhra Pradesh', '[\"Food\",\"WiFi\",\"Laundry\",\"CCTV\"]', '[\"No Late Entry\",\"Parents Visit Allowed\"]', 'active', '2026-05-23 14:50:32', '2026-05-23 14:50:32'),
(3, 'Student Comfort Rooms', 'unisex', 2500.00, 0, 5, 10, 5, 15, 2.50, '9555666777', 'https://maps.google.com/?q=Chennai', 'Velachery, Chennai, Tamil Nadu', '[\"Parking\",\"RO Water\"]', '[\"No Pets\"]', 'active', '2026-05-23 14:50:32', '2026-05-23 14:50:32'),
(4, 'Metro City PG', 'boys', 5200.00, 1, 3, 5, 4, 9, 0.80, '9444455555', 'https://maps.google.com/?q=Hyderabad', 'Ameerpet, Hyderabad, Telangana', '[\"WiFi\",\"Food\",\"Power Backup\"]', '[\"No Alcohol\",\"ID Proof Required\"]', 'active', '2026-05-23 14:50:32', '2026-05-23 14:50:32'),
(5, 'Royal Stay Rooms', 'girls', 6500.00, 1, 2, 4, 2, 6, 1.00, '9333344444', 'https://maps.google.com/?q=Pune', 'Hinjewadi, Pune, Maharashtra', '[\"Gym\",\"WiFi\",\"Laundry\",\"Parking\"]', '[\"Maintain Silence After 10PM\"]', 'active', '2026-05-23 14:50:32', '2026-05-23 14:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `room_photos`
--

CREATE TABLE `room_photos` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_photos`
--

INSERT INTO `room_photos` (`id`, `room_id`, `photo`, `is_primary`, `created_at`) VALUES
(1, 1, 'Uploads/Rooms/R1.1.jpg', 1, '2026-05-23 15:17:47'),
(2, 1, 'Uploads/Rooms/R1.2.jpg', 0, '2026-05-23 15:17:47'),
(3, 2, 'Uploads/Rooms/R2.1.jpg', 1, '2026-05-23 15:17:47'),
(4, 2, 'Uploads/Rooms/R2.2.jpg', 0, '2026-05-23 15:17:47'),
(5, 2, 'Uploads/Rooms/R2.3.jpg', 0, '2026-05-23 15:17:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hostels`
--
ALTER TABLE `hostels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hostel_photos`
--
ALTER TABLE `hostel_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_id` (`hostel_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_photos`
--
ALTER TABLE `room_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hostels`
--
ALTER TABLE `hostels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hostel_photos`
--
ALTER TABLE `hostel_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `room_photos`
--
ALTER TABLE `room_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hostel_photos`
--
ALTER TABLE `hostel_photos`
  ADD CONSTRAINT `hostel_photos_ibfk_1` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_photos`
--
ALTER TABLE `room_photos`
  ADD CONSTRAINT `room_photos_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
