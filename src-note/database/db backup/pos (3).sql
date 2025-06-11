-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2025 at 12:06 PM
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
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `appearance_settings`
--

CREATE TABLE `appearance_settings` (
  `id` int(11) NOT NULL,
  `primary_color` varchar(20) DEFAULT '#1890ff',
  `secondary_color` varchar(20) DEFAULT '#52c41a',
  `theme` varchar(20) DEFAULT 'light',
  `enable_animations` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `appearance_settings`
--

INSERT INTO `appearance_settings` (`id`, `primary_color`, `secondary_color`, `theme`, `enable_animations`, `created_at`, `updated_at`) VALUES
(1, '#1890ff', '#52c41a', 'light', 0, '2025-06-09 18:10:46', '2025-06-10 07:54:43');

-- --------------------------------------------------------

--
-- Table structure for table `brand`
--

CREATE TABLE `brand` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `brand`
--

INSERT INTO `brand` (`id`, `label`, `country`, `note`, `created_at`, `updated_at`) VALUES
(1, 'Apple ', 'USA', NULL, '2025-06-10 06:57:35', '2025-06-10 06:57:35'),
(2, 'Samsung', 'South Korea', NULL, '2025-06-10 07:12:10', '2025-06-10 07:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `Id` int(11) NOT NULL,
  `Name` varchar(120) NOT NULL,
  `Description` text DEFAULT NULL,
  `ParentId` int(11) DEFAULT NULL,
  `Status` tinyint(1) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`Id`, `Name`, `Description`, `ParentId`, `Status`, `create_at`) VALUES
(18, 'Computer', NULL, 1, 1, '2025-06-06 07:55:27'),
(19, 'Laptop', NULL, 1, 1, '2025-06-06 07:55:38'),
(20, 'Smart Phone', NULL, 1, 1, '2025-06-06 07:55:54'),
(21, 'Accessory ', NULL, 1, 1, '2025-06-06 07:56:10'),
(22, 'Headphone ', NULL, 1, 1, '2025-06-06 07:56:29'),
(23, 'Charger', NULL, 1, 1, '2025-06-08 03:30:13'),
(24, 'Watch', NULL, 1, 1, '2025-06-10 07:11:51');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `type` varchar(120) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `name`, `tel`, `email`, `address`, `type`, `create_by`, `create_at`) VALUES
(1, 'Nget samsombo', '0123456987', 'samsombo.nget24@gmail.com', '558 907 ToulsangKe RussieKoe\n558 907 ToulsangKe RussieKoe', NULL, 'HengZin', '2025-06-08 20:50:14'),
(2, 'Sok heng', '0456982222', 'Sokheng@gmail.com', NULL, NULL, 'HengZin', '2025-06-08 20:55:38'),
(3, 'Sok heng1', '456982222', 'Sokheng@gmail.com', NULL, NULL, 'HengZin', '2025-06-09 09:01:15'),
(4, 'roth', '061734232', 'roth@gmail.com', '558 , 907,907,02', NULL, 'HengZin', '2025-06-09 09:10:18'),
(5, 'Vireak', '010630762', 'REakviii@gmail.com', '558 907 ToulsangKe RussieKoe', NULL, 'sombo1', '2025-06-10 05:59:44'),
(6, 'Vireak1', '0617342327', 'REa1kviii@gmail.com', NULL, NULL, 'sombo1', '2025-06-10 06:03:11'),
(7, 'vid', '014785236', 'vid123@gmail.com', 'kompong thom', NULL, 'sombo1', '2025-06-10 06:17:20'),
(8, 'Ka', '096325874', 'ka123@gmail.com', NULL, NULL, 'sombo1', '2025-06-10 07:05:57'),
(9, 'Ka1', '025866475', 'ka123@gmail.com', NULL, NULL, 'sombo1', '2025-06-10 07:06:31'),
(10, 'Ka12', '098753159', 'ka1232@gmail.com', NULL, NULL, 'HengZin', '2025-06-10 10:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `id` int(11) NOT NULL,
  `expense_type_id` int(11) DEFAULT NULL,
  `ref_no` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(6,2) DEFAULT 0.00,
  `remark` text DEFAULT NULL,
  `expense_date` datetime DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_type`
--

CREATE TABLE `expense_type` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `change_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'completed',
  `create_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `currency` varchar(10) DEFAULT 'USD',
  `exchange_rate_to_usd` decimal(10,4) DEFAULT 1.0000
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `customer_id`, `total_amount`, `payment_method`, `payment_amount`, `change_amount`, `status`, `create_by`, `created_at`, `currency`, `exchange_rate_to_usd`) VALUES
(1, 'ORD202506090001', 2, 269.00, 'cash', 269.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:45:47', 'USD', 1.0000),
(2, 'ORD202506090002', 1, 729.00, 'cash', 729.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:46:15', 'USD', 1.0000),
(3, 'ORD202506090003', 1, 230.00, 'card', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:47:53', 'USD', 1.0000),
(4, 'ORD202506090004', 2, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:50:08', 'USD', 1.0000),
(5, 'ORD202506090005', 2, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:52:54', 'USD', 1.0000),
(6, 'ORD202506090006', 1, 10522.00, 'cash', 10522.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:54:57', 'USD', 1.0000),
(7, 'ORD202506090007', 1, 10522.00, 'cash', 10522.00, 0.00, 'completed', 'HengZin', '2025-06-09 07:55:25', 'USD', 1.0000),
(8, 'ORD202506090008', 1, 10522.00, 'cash', 10522.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:01:44', 'USD', 1.0000),
(9, 'ORD202506090009', 1, 10522.00, 'cash', 10522.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:01:47', 'USD', 1.0000),
(10, 'ORD202506090010', 1, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:21:29', 'USD', 1.0000),
(11, 'ORD202506090011', 2, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:27:25', 'USD', 1.0000),
(12, 'ORD202506090012', 1, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:43:37', 'USD', 1.0000),
(13, 'ORD202506090013', 1, 499.00, 'cash', 499.00, 0.00, 'completed', 'HengZin', '2025-06-09 08:57:25', 'USD', 1.0000),
(14, 'ORD202506090014', 3, 460.00, 'cash', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:06:25', 'USD', 1.0000),
(15, 'ORD202506090015', 4, 460.00, 'cash', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:11:56', 'USD', 1.0000),
(16, 'ORD202506090016', 4, 460.00, 'cash', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:12:07', 'USD', 1.0000),
(17, 'ORD202506090017', 4, 414.00, 'cash', 414.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:14:48', 'USD', 1.0000),
(18, 'ORD202506090018', 4, 460.00, 'cash', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:14:54', 'USD', 1.0000),
(19, 'ORD202506090019', 4, 230.00, 'cash', 230.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:15:01', 'USD', 1.0000),
(20, 'ORD202506090020', 4, 460.00, 'card', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:15:18', 'USD', 1.0000),
(21, 'ORD202506090021', 4, 460.00, 'bank', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:15:22', 'USD', 1.0000),
(22, 'ORD202506090022', 4, 460.00, 'cash', 460.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:15:29', 'USD', 1.0000),
(23, 'ORD202506090023', 1, 3450.00, 'cash', 3450.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:27:45', 'USD', 1.0000),
(24, 'ORD202506090024', 4, 129.00, 'cash', 129.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:36:19', 'USD', 1.0000),
(25, 'ORD202506090025', 4, 516.00, 'cash', 516.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:37:00', 'USD', 1.0000),
(26, 'ORD202506090026', 4, 2228.00, 'cash', 2228.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:37:49', 'USD', 1.0000),
(27, 'ORD202506090027', 1, 4198.00, 'cash', 4198.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:38:19', 'USD', 1.0000),
(28, 'ORD202506090028', 1, 4198.00, 'cash', 4198.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:43:10', 'USD', 1.0000),
(29, 'ORD202506090029', 4, 129.00, 'cash', 129.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:52:22', 'USD', 1.0000),
(30, 'ORD202506090030', 4, 269.00, 'cash', 269.00, 0.00, 'completed', 'HengZin', '2025-06-09 09:55:31', 'USD', 1.0000),
(31, 'ORD202506090031', 4, 2228.00, 'cash', 2228.00, 0.00, 'completed', 'HengZin', '2025-06-09 10:26:02', 'USD', 1.0000),
(32, 'ORD202506090032', 4, 2099.00, 'cash', 2099.00, 0.00, 'completed', 'HengZin', '2025-06-09 11:11:05', 'USD', 1.0000),
(33, 'ORD202506090033', 2, 1499.00, 'card', 1499.00, 0.00, 'completed', 'HengZin', '2025-06-09 11:28:41', 'USD', 1.0000),
(34, 'ORD202506090034', 3, 2099.00, 'cash', 2099.00, 0.00, 'completed', 'sombo1', '2025-06-09 11:37:21', 'USD', 1.0000),
(35, 'ORD202506090035', 4, 2099.00, 'qrcode', 2099.00, 0.00, 'completed', 'sombo1', '2025-06-09 11:43:47', 'USD', 1.0000),
(36, 'ORD202506090036', 4, 2099.00, 'qrcode', 2099.00, 0.00, 'completed', 'sombo1', '2025-06-09 11:45:04', 'USD', 1.0000),
(37, 'ORD202506090037', 4, 2099.00, 'qrcode', 2099.00, 0.00, 'completed', 'sombo1', '2025-06-09 11:45:21', 'USD', 1.0000),
(38, 'ORD202506090038', 2, 1199.00, 'cash', 1199.00, 0.00, 'completed', 'sombo1', '2025-06-09 12:27:05', 'USD', 1.0000),
(39, 'ORD202506100039', 3, 1604.00, 'cash', 1604.00, 0.00, 'completed', 'sombo1', '2025-06-09 17:01:09', 'USD', 1.0000),
(40, 'ORD202506100040', 4, 10495.00, 'cash', 10495.00, 0.00, 'completed', 'sombo1', '2025-06-09 17:15:27', 'USD', 1.0000),
(41, 'ORD202506100041', 4, 10495.00, 'cash', 10495.00, 0.00, 'completed', 'sombo1', '2025-06-09 17:15:32', 'USD', 1.0000),
(42, 'ORD202506100042', 3, 2565.00, 'cash', 2565.00, 0.00, 'completed', 'sombo1', '2025-06-09 17:44:38', 'USD', 1.0000),
(43, 'ORD202506100043', 3, 8819.00, 'cash', 8819.00, 0.00, 'completed', 'sombo1', '2025-06-09 18:52:59', 'USD', 1.0000),
(44, 'ORD202506100044', 4, 1199.00, 'cash', 1199.00, 0.00, 'completed', 'sombo1', '2025-06-09 19:52:43', 'USD', 1.0000),
(45, 'ORD202506100045', 2, 749.00, 'cash', 749.00, 0.00, 'completed', 'sombo1', '2025-06-09 19:56:54', 'USD', 1.0000),
(46, 'ORD202506100046', 2, 14378.00, 'cash', 14378.00, 0.00, 'completed', 'sombo1', '2025-06-09 20:04:43', 'USD', 1.0000),
(47, 'ORD202506100047', 3, 2099.00, 'cash', 2099.00, 0.00, 'completed', 'sombo1', '2025-06-09 20:23:38', 'USD', 1.0000),
(48, 'ORD202506100048', 2, 1499.00, 'cash', 1499.00, 0.00, 'completed', 'sombo1', '2025-06-10 05:38:13', 'USD', 1.0000),
(49, 'ORD202506100049', 6, 1349.10, 'card', 1349.10, 0.00, 'completed', 'sombo1', '2025-06-10 06:03:31', 'USD', 1.0000),
(50, 'ORD202506100050', 5, 133.00, 'bank', 133.00, 0.00, 'completed', 'sombo1', '2025-06-10 06:16:29', 'USD', 1.0000),
(51, 'ORD202506100051', 4, 15.00, 'cash', 15.00, 0.00, 'completed', 'sombo1', '2025-06-10 07:05:28', 'USD', 1.0000),
(52, 'ORD202506100052', 8, 19.00, 'cash', 19.00, 0.00, 'completed', 'sombo1', '2025-06-10 07:06:12', 'USD', 1.0000),
(53, 'ORD202506100053', 9, 15.00, 'cash', 15.00, 0.00, 'completed', 'sombo1', '2025-06-10 09:09:22', 'USD', 1.0000),
(54, 'ORD202506100054', 9, 15.00, 'cash', 15.00, 0.00, 'completed', 'HengZin', '2025-06-10 10:04:29', 'USD', 1.0000),
(55, 'ORD202506100055', 10, 269.00, 'cash', 269.00, 0.00, 'completed', 'HengZin', '2025-06-10 10:04:56', 'USD', 1.0000);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `discount`) VALUES
(1, 1, 47, 1, 269.00, 0.00),
(2, 2, 47, 1, 269.00, 0.00),
(3, 2, 49, 1, 230.00, 0.00),
(4, 2, 51, 1, 230.00, 0.00),
(5, 3, 51, 1, 230.00, 0.00),
(6, 4, 51, 1, 230.00, 0.00),
(7, 5, 51, 1, 230.00, 0.00),
(8, 6, 47, 1, 269.00, 0.00),
(9, 6, 51, 1, 230.00, 0.00),
(10, 6, 45, 1, 129.00, 0.00),
(11, 6, 43, 1, 2099.00, 0.00),
(12, 6, 35, 2, 2099.00, 0.00),
(13, 6, 18, 3, 1199.00, 0.00),
(14, 7, 47, 1, 269.00, 0.00),
(15, 7, 51, 1, 230.00, 0.00),
(16, 7, 45, 1, 129.00, 0.00),
(17, 7, 43, 1, 2099.00, 0.00),
(18, 7, 35, 2, 2099.00, 0.00),
(19, 7, 18, 3, 1199.00, 0.00),
(20, 8, 47, 1, 269.00, 0.00),
(21, 8, 51, 1, 230.00, 0.00),
(22, 8, 45, 1, 129.00, 0.00),
(23, 8, 43, 1, 2099.00, 0.00),
(24, 8, 35, 2, 2099.00, 0.00),
(25, 8, 18, 3, 1199.00, 0.00),
(26, 9, 47, 1, 269.00, 0.00),
(27, 9, 51, 1, 230.00, 0.00),
(28, 9, 45, 1, 129.00, 0.00),
(29, 9, 43, 1, 2099.00, 0.00),
(30, 9, 35, 2, 2099.00, 0.00),
(31, 9, 18, 3, 1199.00, 0.00),
(32, 10, 53, 1, 230.00, 0.00),
(33, 11, 51, 1, 230.00, 0.00),
(34, 12, 51, 1, 230.00, 0.00),
(35, 13, 51, 1, 230.00, 0.00),
(36, 13, 47, 1, 269.00, 0.00),
(37, 14, 49, 1, 230.00, 0.00),
(38, 14, 53, 1, 230.00, 0.00),
(39, 15, 53, 1, 230.00, 0.00),
(40, 15, 51, 1, 230.00, 0.00),
(41, 16, 53, 1, 230.00, 0.00),
(42, 16, 51, 1, 230.00, 0.00),
(43, 17, 53, 1, 230.00, 0.00),
(44, 17, 51, 1, 230.00, 0.00),
(45, 18, 53, 1, 230.00, 0.00),
(46, 18, 51, 1, 230.00, 0.00),
(47, 19, 53, 1, 230.00, 0.00),
(48, 19, 51, 1, 230.00, 0.00),
(49, 20, 53, 1, 230.00, 0.00),
(50, 20, 51, 1, 230.00, 0.00),
(51, 21, 53, 1, 230.00, 0.00),
(52, 21, 51, 1, 230.00, 0.00),
(53, 22, 53, 1, 230.00, 0.00),
(54, 22, 51, 1, 230.00, 0.00),
(55, 23, 49, 15, 230.00, 0.00),
(56, 24, 45, 1, 129.00, 0.00),
(57, 25, 45, 4, 129.00, 0.00),
(58, 26, 43, 1, 2099.00, 0.00),
(59, 26, 45, 1, 129.00, 0.00),
(60, 27, 43, 1, 2099.00, 0.00),
(61, 27, 35, 1, 2099.00, 0.00),
(62, 28, 43, 1, 2099.00, 0.00),
(63, 28, 35, 1, 2099.00, 0.00),
(64, 29, 45, 1, 129.00, 0.00),
(65, 30, 47, 1, 269.00, 0.00),
(66, 31, 43, 1, 2099.00, 0.00),
(67, 31, 45, 1, 129.00, 0.00),
(68, 32, 43, 1, 2099.00, 0.00),
(69, 33, 22, 1, 1499.00, 0.00),
(70, 34, 43, 1, 2099.00, 0.00),
(71, 35, 43, 1, 2099.00, 0.00),
(72, 36, 43, 1, 2099.00, 0.00),
(73, 37, 43, 1, 2099.00, 0.00),
(74, 38, 18, 1, 1199.00, 0.00),
(75, 39, 8, 1, 749.00, 0.00),
(76, 39, 10, 1, 855.00, 0.00),
(77, 40, 35, 5, 2099.00, 0.00),
(78, 41, 35, 5, 2099.00, 0.00),
(79, 42, 10, 3, 855.00, 0.00),
(80, 43, 47, 1, 269.00, 0.00),
(81, 43, 10, 10, 855.00, 0.00),
(82, 44, 18, 1, 1199.00, 0.00),
(83, 45, 8, 1, 749.00, 0.00),
(84, 46, 8, 1, 749.00, 0.00),
(85, 46, 6, 21, 649.00, 0.00),
(86, 47, 43, 1, 2099.00, 0.00),
(87, 48, 22, 1, 1499.00, 0.00),
(88, 49, 22, 1, 1499.00, 0.00),
(89, 50, 54, 7, 19.00, 0.00),
(90, 51, 55, 1, 15.00, 0.00),
(91, 52, 54, 1, 19.00, 0.00),
(92, 53, 55, 1, 15.00, 0.00),
(93, 54, 55, 1, 15.00, 0.00),
(94, 55, 47, 1, 269.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `payment_requests`
--

CREATE TABLE `payment_requests` (
  `id` int(11) NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `merchant_id` varchar(50) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `payment_requests`
--

INSERT INTO `payment_requests` (`id`, `reference_number`, `amount`, `currency`, `merchant_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INV1749469856354', 2099.00, 'KHR', 'YOUR_MERCHANT_ID', 'pending', '2025-06-09 18:50:56', '2025-06-09 18:50:56'),
(2, 'INV1749471216373', 129.00, 'KHR', 'ec460610', 'pending', '2025-06-09 19:13:36', '2025-06-09 19:13:36'),
(3, 'INV1749471334730', 129.00, 'KHR', 'ec460610', 'pending', '2025-06-09 19:15:34', '2025-06-09 19:15:34'),
(4, 'INV1749471543428', 129.00, 'KHR', 'ec460610', 'pending', '2025-06-09 19:19:03', '2025-06-09 19:19:03'),
(5, 'INV1749471723845', 129.00, 'KHR', 'ec460610', 'pending', '2025-06-09 19:22:03', '2025-06-09 19:22:03'),
(6, 'INV1749471752244', 1199.00, 'KHR', 'ec460610', 'pending', '2025-06-09 19:22:32', '2025-06-09 19:22:32'),
(7, 'INV1749471965912', 1199.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:26:05', '2025-06-09 19:26:06'),
(8, 'INV1749471967654', 1199.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:26:07', '2025-06-09 19:26:08'),
(9, 'INV1749471968085', 1199.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:26:08', '2025-06-09 19:26:08'),
(10, 'INV1749472205324', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:05', '2025-06-09 19:30:06'),
(11, 'INV1749472208159', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:08', '2025-06-09 19:30:08'),
(12, 'INV1749472211079', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:11', '2025-06-09 19:30:11'),
(13, 'INV1749472212535', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:12', '2025-06-09 19:30:13'),
(14, 'INV1749472214002', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:14', '2025-06-09 19:30:14'),
(15, 'INV1749472214780', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:14', '2025-06-09 19:30:15'),
(16, 'INV1749472215689', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:15', '2025-06-09 19:30:16'),
(17, 'INV1749472216440', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:16', '2025-06-09 19:30:16'),
(18, 'INV1749472217330', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:17', '2025-06-09 19:30:17'),
(19, 'INV1749472225907', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:30:25', '2025-06-09 19:30:26'),
(20, 'INV1749472352437', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:32:32', '2025-06-09 19:32:33'),
(21, 'INV1749472534840', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:35:34', '2025-06-09 19:35:35'),
(22, 'INV1749472564979', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:36:04', '2025-06-09 19:36:05'),
(23, 'INV1749472594311', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:36:34', '2025-06-09 19:36:35'),
(24, 'INV1749472668706', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:37:48', '2025-06-09 19:37:49'),
(25, 'INV1749472711047', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:38:31', '2025-06-09 19:38:31'),
(26, 'INV1749472842660', 2099.00, 'KHR', 'ec460610', 'failed', '2025-06-09 19:40:42', '2025-06-09 19:40:43');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `name` varchar(120) NOT NULL,
  `brand` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `qty` int(6) NOT NULL DEFAULT 0,
  `price` decimal(6,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(3,2) NOT NULL DEFAULT 0.00,
  `status` tinyint(1) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `category_id`, `barcode`, `name`, `brand`, `description`, `qty`, `price`, `discount`, `status`, `image`, `create_by`, `create_at`) VALUES
(6, 20, 'P003', 'Iphone 15 ', 'Apple', 'undefined', 29, 649.00, 0.00, 0, 'iphone15.jpg-1749198362277-95912613.jpg', NULL, '2025-06-06 08:26:02'),
(8, 20, 'P007', 'Iphone 15 plus', 'Apple', '256g Ram8g', 47, 749.00, 0.00, 0, '15plus.jpg-1749198445161-582575416', NULL, '2025-06-06 08:27:25'),
(10, 20, 'P009', 'Iphone 16', 'Apple', 'ZA/A 256g Ram8g', 36, 855.00, 0.00, 1, '15plus.jpg-1749198586955-805791052', NULL, '2025-06-06 08:29:46'),
(12, 20, 'P011', 'Iphone 16 pro max', 'Apple', 'X/A 256g Ram8g', 21, 1199.00, 0.00, 1, 'iphone-16-pro-max-desert-titanium.jpg-1749198856062-837912864', NULL, '2025-06-06 08:34:16'),
(14, 20, 'P013', 'Glalaxy S25', 'Samsung', '256GB/12GB', 33, 849.00, 0.00, 1, 'galaxy-s25-blue.jpg-1749199031522-782132134', 'HengZin', '2025-06-06 08:37:11'),
(18, 20, 'P017', 'Galaxy S25 Ultra', 'Samsung', '256GB/12GB', 16, 1199.00, 0.00, 1, 'S25-Ultra-Titanium-Gray.jpg-1749199208382-164300442', 'HengZin', '2025-06-06 08:40:08'),
(22, 19, 'P019', 'ASUS ROG StrixG16', 'ASUS', 'G614JVR-N3073W Volt-GREEN - i9-14900HX-16GB-1TB-RTX™4060 8GB-16\"FHD-Wi11-2Y', 32, 1499.00, 0.00, 1, 'asusrogstrix.png-1749199813478-603806086', 'HengZin', '2025-06-06 08:50:13'),
(24, 19, 'P023', 'Dell Alienware m16 R2', 'DELL', 'undefined', 20, 2049.00, 0.00, 1, 'dellAlainwear.png-1749280103976-931754368', 'HengZin', '2025-06-07 07:08:23'),
(30, 20, 'P029', 'Pixel A9', 'Pixel', 'undefined', 12, 499.00, 0.00, 1, 'pixel.jpg-1749352476416-950557310', 'sombo1', '2025-06-08 03:14:36'),
(35, 19, 'P031', 'MacBook Pro M4', 'Apple', 'undefined', 5, 2099.00, 0.00, 1, 'apple-macbook-pro-m4-lineup.png-1749358874153-941859302', 'HengZin', '2025-06-08 05:01:14'),
(43, 19, 'P036', 'MacBook Pro M2', 'Apple', 'undefined', 12, 2099.00, 0.00, 1, 'apple-macbook-pro-m4-lineup.png-1749364310141-11520615', 'HengZin', '2025-06-08 06:31:50'),
(45, 22, 'P044', 'Sony WH-CH720N Wireless Noise Canceling Headphone', 'Sony', 'undefined', 11, 129.00, 0.00, 1, 'Sony-WH-CH720N-Wireless-Noise-Canceling-Headphone-Black.jpg-1749403375478-803878005', 'HengZin', '2025-06-08 17:22:55'),
(47, 20, 'P046', 'Tecno CAMON 40 Pro 5G', 'Techno', '256GB|8+8GB', 7, 269.00, 0.00, 1, 'CAMON-40-Pro-5g-Emerald-Lake-Green.jpg-1749404067004-522554675', 'HengZin', '2025-06-08 17:34:27'),
(49, 22, 'P048', 'AirPods Pro', 'Apple', '(2nd generation)', 0, 230.00, 0.00, 1, 'Airportpro2.jpg-1749406452579-472928070', 'HengZin', '2025-06-08 18:14:12'),
(51, 18, 'P050', 'AirPods Pro 2', 'Samsung', 'undefined', 0, 230.00, 0.00, 1, 'Airportpro2.jpg-1749452574860-892654378', 'HengZin', '2025-06-09 07:02:54'),
(53, 18, 'P052', 'AirPods Pro 1', 'Apple', 'undefined', 0, 230.00, 0.00, 1, 'Airportpro2.jpg-1749452975082-445686932', 'HengZin', '2025-06-09 07:09:35'),
(54, 23, 'P054', 'Charger 20W', 'Apple', 'undefined', 92, 19.00, 0.00, 1, 'charger20w.jpg-1749534639117-853992821', 'sombo1', '2025-06-10 05:50:39'),
(55, 23, 'P055', 'Super Fast Charge Travel Adapter (25W)', 'Samsung', 'Super Fast Charging requires a USB PD 3.0 compatible device that supports Direct Charging', 47, 15.00, 0.00, 1, 'Samsung-Type-C-Charging-Adapter-20w-with-Cable-1.jpg-1749536491479-778710697', 'sombo1', '2025-06-10 06:19:28'),
(56, 24, 'P056', 'Apple Watch Series 10', '2', 'Dimensions	46 x 39 x 9.7 mm (1.81 x 1.54 x 0.38 in)\r\nWeight	34.4 g (42mm), 41.7 g (46mm) (1.48 oz)\r\nBuild	Glass front, ceramic/sapphire crystal back, titanium frame (grade 5)\r\nSIM	eSIM (Cambodia GPS)\r\nIP6X certified\r\n50m water resistant\r\nECG certified (region dependent SW application; HW available on all models)\r\nDepth gauge to 6m', 15, 389.00, 0.00, 1, 'Apple-Watch-10_Pink.jpg-1749539616500-680935450', 'sombo1', '2025-06-10 07:13:36');

-- --------------------------------------------------------

--
-- Table structure for table `product_image`
--

CREATE TABLE `product_image` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase`
--

CREATE TABLE `purchase` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `ref` varchar(255) NOT NULL,
  `shipp_company` varchar(255) DEFAULT NULL,
  `shipp_cost` decimal(6,2) DEFAULT 0.00,
  `paid_amount` decimal(6,2) DEFAULT 0.00,
  `paid_date` datetime DEFAULT NULL,
  `status` varchar(120) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order`
--

CREATE TABLE `purchase_order` (
  `id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','received','cancelled') NOT NULL DEFAULT 'pending',
  `create_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `purchase_order`
--

INSERT INTO `purchase_order` (`id`, `order_number`, `supplier_id`, `order_date`, `expected_delivery_date`, `notes`, `total_amount`, `status`, `create_by`, `created_at`) VALUES
(1, 'PO202506080001', 4, '2025-06-07', '2025-06-08', NULL, 2247.00, 'received', 'HengZin', '2025-06-08 06:47:07'),
(2, 'PO202506080002', 4, '2025-06-08', '2025-06-11', NULL, 20490.00, 'received', 'HengZin', '2025-06-08 07:06:45'),
(3, 'PO202506080003', 28, '2025-06-08', '2025-06-13', NULL, 650.00, 'received', 'HengZin', '2025-06-08 07:10:24'),
(4, 'PO202506080004', 28, '2025-06-08', '2025-06-13', NULL, 6000.00, 'received', 'HengZin', '2025-06-08 07:10:33'),
(5, 'PO202506080005', 20, '2025-06-08', '2025-06-11', NULL, 1111.00, 'received', 'HengZin', '2025-06-08 09:49:02'),
(6, 'PO202506080006', 4, '2025-06-08', '2025-06-09', 'test', 20990.00, 'received', 'HengZin', '2025-06-08 16:50:39'),
(7, 'PO202506090007', 4, '2025-06-09', '2025-06-10', NULL, 7495.00, 'received', 'HengZin', '2025-06-08 17:12:26'),
(8, 'PO202506090008', 20, '2025-06-09', '2025-06-10', NULL, 2000.00, 'received', 'HengZin', '2025-06-08 17:44:48'),
(9, 'PO202506090009', 4, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for Tecno CAMON 40 Pro 5G due to low stock (Current: 5, Threshold: 10)', 1345.00, 'received', 'HengZin', '2025-06-08 18:01:22'),
(10, 'PO202506090010', 20, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for Sony WH-CH720N Wireless Noise Canceling Headphone due to low stock (Current: 5, Threshold: 10)', 1935.00, 'received', 'HengZin', '2025-06-08 18:02:23'),
(11, 'PO202506090011', 20, '2025-06-09', '2025-06-13', NULL, 1883.00, 'received', 'HengZin', '2025-06-08 18:06:07'),
(12, 'PO202506090012', 4, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for AirPods Pro due to low stock (Current: 5, Threshold: 10)', 2760.00, 'received', 'HengZin', '2025-06-08 18:14:30'),
(13, 'PO202506090013', 4, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for AirPods Pro due to low stock (Current: 5, Threshold: 10)', 2300.00, 'received', 'HengZin', '2025-06-09 07:03:13'),
(14, 'PO202506090014', 20, '2025-06-09', '2025-06-11', NULL, 555.00, 'received', 'HengZin', '2025-06-09 07:47:23'),
(15, 'PO202506090015', 20, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for AirPods Pro due to low stock (Current: -5, Threshold: 10)', 1150.00, 'received', 'HengZin', '2025-06-09 09:21:29'),
(16, 'PO202506090016', 27, '2025-06-09', '2025-06-16', 'Auto-generated purchase order for AirPods Pro due to low stock (Current: -4, Threshold: 10)', 920.00, 'received', 'HengZin', '2025-06-09 09:26:22'),
(17, 'PO202506100017', 30, '2025-06-10', '2025-06-17', 'Auto-generated purchase order for Sony WH-CH720N Wireless Noise Canceling Headphone due to low stock (Current: 8, Threshold: 10)', 387.00, 'received', 'sombo1', '2025-06-10 06:11:11'),
(18, 'PO202506100018', 30, '2025-06-10', '2025-06-17', 'Auto-generated purchase order for MacBook Pro M2 due to low stock (Current: 2, Threshold: 10)', 20990.00, 'received', 'sombo1', '2025-06-10 06:12:12'),
(19, 'PO202506100019', 30, '2025-06-10', '2025-06-11', NULL, 0.00, 'received', 'sombo1', '2025-06-10 06:13:00'),
(20, 'PO202506100020', 31, '2025-06-10', '2025-06-11', NULL, 0.00, 'pending', 'sombo1', '2025-06-10 07:15:27');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_item`
--

CREATE TABLE `purchase_order_item` (
  `id` int(11) NOT NULL,
  `purchase_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `purchase_order_item`
--

INSERT INTO `purchase_order_item` (`id`, `purchase_order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(8, 4, 35, 3, 2000.00, '2025-06-08 16:45:23'),
(9, 5, 12, 1, 1111.00, '2025-06-08 16:49:46'),
(11, 6, 43, 10, 2099.00, '2025-06-08 16:50:59'),
(12, 2, 24, 10, 2049.00, '2025-06-08 16:59:55'),
(13, 1, 14, 3, 749.00, '2025-06-08 17:06:16'),
(15, 7, 22, 5, 1499.00, '2025-06-08 17:12:57'),
(25, 8, 35, 1, 2000.00, '2025-06-08 17:48:28'),
(27, 9, 47, 5, 269.00, '2025-06-08 18:01:33'),
(29, 10, 45, 15, 129.00, '2025-06-08 18:02:30'),
(31, 11, 47, 7, 269.00, '2025-06-08 18:06:13'),
(33, 12, 49, 12, 230.00, '2025-06-08 18:14:45'),
(35, 13, 51, 10, 230.00, '2025-06-09 07:03:19'),
(39, 15, 53, 5, 230.00, '2025-06-09 09:25:51'),
(41, 16, 51, 4, 230.00, '2025-06-09 09:26:26'),
(42, 14, 43, 1, 555.00, '2025-06-09 17:17:23'),
(44, 17, 45, 3, 129.00, '2025-06-10 06:11:25'),
(46, 18, 43, 10, 2099.00, '2025-06-10 06:12:19'),
(48, 19, 45, 1, 0.00, '2025-06-10 06:13:06'),
(49, 20, 56, 1, 0.00, '2025-06-10 07:15:27');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_product`
--

CREATE TABLE `purchase_product` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT 0,
  `cost` decimal(6,2) DEFAULT 0.00,
  `discount` decimal(6,2) DEFAULT 0.00,
  `amount` decimal(6,2) DEFAULT 0.00,
  `retail_price` decimal(6,2) DEFAULT 0.00,
  `remark` text DEFAULT NULL,
  `status` varchar(120) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `code`) VALUES
(1, 'Admin', 'Admin'),
(2, 'Manager', 'manager'),
(3, 'Account', 'Account'),
(4, 'Cashier', 'Cashier');

-- --------------------------------------------------------

--
-- Table structure for table `store_settings`
--

CREATE TABLE `store_settings` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `exchange_rate_to_usd` decimal(10,4) DEFAULT 1.0000
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `store_settings`
--

INSERT INTO `store_settings` (`id`, `name`, `address`, `phone`, `email`, `website`, `currency`, `tax_rate`, `logo`, `created_at`, `updated_at`, `exchange_rate_to_usd`) VALUES
(1, 'Phone Shop', 'Cambodia', '061734232', 'contact@phoneshop.com', 'www.phoneshop.com', 'USD', 0.00, 'logo-1749533864110-559095929.jpg', '2025-06-09 18:10:46', '2025-06-10 07:38:27', 1.0000);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(18) NOT NULL,
  `tel` varchar(18) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website` varchar(120) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`id`, `name`, `code`, `tel`, `email`, `address`, `website`, `note`, `create_by`, `create_at`) VALUES
(4, 'usa-123', 'usa-123', '061734232', 'usa-123@gmail.com', '#1236 str 982', NULL, 'loy ', 'HengZin', '2025-06-01 04:56:14'),
(20, 'vn-102fsdfsd', 'vn-102ee', '123654789', 'vn-10e2@gmail.com', 'vn-102', 'vn-102.com', NULL, 'HengZin', '2025-06-01 05:43:46'),
(27, 'ewterga', 'egaegaw', 'gawg34t', 'wgwgwega4', 'wgwg', NULL, NULL, 'HengZin', '2025-06-05 10:58:41'),
(28, 'soh', 'vn-123', '0235679855', 'vn-123@gmail.com', 'vatnam', NULL, NULL, 'sombo1', '2025-06-08 02:56:44'),
(30, 'Nget samsombo', 'KH-100', '0617342328', 'samsombo.nget24@gmail.com', '558 907 ToulsangKe RussieKoe', NULL, NULL, 'sombo1', '2025-06-10 05:55:31'),
(31, 'Davit ph', 'KH-1002', '03258753', 'vitda123@gmail.com', 'SR', NULL, NULL, 'sombo1', '2025-06-10 07:14:50');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `enable_notifications` tinyint(1) DEFAULT 1,
  `enable_email_notifications` tinyint(1) DEFAULT 1,
  `enable_sms_notifications` tinyint(1) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 10,
  `enable_auto_backup` tinyint(1) DEFAULT 1,
  `backup_frequency` varchar(50) DEFAULT 'daily',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `enable_notifications`, `enable_email_notifications`, `enable_sms_notifications`, `low_stock_threshold`, `enable_auto_backup`, `backup_frequency`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 0, 10, 1, 'daily', '2025-06-09 18:10:46', '2025-06-09 18:10:46');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `name` varchar(120) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `role_id`, `name`, `username`, `password`, `is_active`, `create_by`, `create_at`) VALUES
(1, 1, 'boo', 'bo22@gmail.com', '123456', NULL, NULL, '2025-05-26 03:40:15'),
(6, 1, 'HengZin', 'heng11@gmail.com', '$2b$10$WPGxBwt1tXBI3MF.Ze0Pruj4BleaxpTOd.gAsSgIhbhlw0MNRBRH2', 1, 'bo', '2025-05-26 05:51:27'),
(7, 1, 'HengZin2', 'heng111@gmail.com', '$2b$10$h.xE1k/7QU8pMlscALzzFOvCUAQ6i3fcLX23VoaCrGOmUV3v.CR3.', 1, 'bo', '2025-05-26 06:15:33'),
(8, 1, 'Bo', 'Bo12@gmail.com', '$2b$10$WTCLZw5EgyjOC3DvBiP.Au8uwxBBS7vW/3Tcx5BbWJ91uoDbrM9fq', 1, 'HengZin', '2025-05-28 06:22:07'),
(20, 2, 'ffffff', 'Bo1123@gmail.com', '$2b$10$lBlOyD9gtYM6dy9sBAgTrOE4pQy6qkGJvaljHn/tJOM9VMPllp0TO', 1, NULL, '2025-05-28 06:42:23'),
(21, 3, 'fafafaf', 'Bo12d@gmail.com', '$2b$10$QqOiDQq07Q1KE3d6NChere4jE2gGz5.ZASFlTbMuV7vf3jrGGiIzO', 1, 'HengZin', '2025-05-28 06:42:58'),
(22, 2, 'ah heng', 'hoo123@gmail.com', '$2b$10$sszSBdK2MNRvBpo.VMBJrOZhK2//Pz5H7H0IBGkef1T/uaq6TKoo2', 0, 'ffffff', '2025-05-28 07:07:34'),
(25, 2, 'sombo1', 'sombo@gmail.com', '$2b$10$FDMO9LzX53ZD5RyhC624ReJUoKBpxGa3Oq8j1WPIQOghj0c7ICY.W', 1, 'HengZin', '2025-06-08 02:38:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appearance_settings`
--
ALTER TABLE `appearance_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tel` (`tel`);

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_type_id` (`expense_type_id`);

--
-- Indexes for table `expense_type`
--
ALTER TABLE `expense_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `payment_requests`
--
ALTER TABLE `payment_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_image`
--
ALTER TABLE `product_image`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `purchase`
--
ALTER TABLE `purchase`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `purchase_order_item`
--
ALTER TABLE `purchase_order_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `purchase_product`
--
ALTER TABLE `purchase_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `purchase_id` (`purchase_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `tel` (`tel`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appearance_settings`
--
ALTER TABLE `appearance_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `brand`
--
ALTER TABLE `brand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_type`
--
ALTER TABLE `expense_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `payment_requests`
--
ALTER TABLE `payment_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `product_image`
--
ALTER TABLE `product_image`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase`
--
ALTER TABLE `purchase`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_order`
--
ALTER TABLE `purchase_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `purchase_order_item`
--
ALTER TABLE `purchase_order_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `purchase_product`
--
ALTER TABLE `purchase_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `store_settings`
--
ALTER TABLE `store_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `expense_ibfk_1` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_type` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`Id`);

--
-- Constraints for table `product_image`
--
ALTER TABLE `product_image`
  ADD CONSTRAINT `product_image_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

--
-- Constraints for table `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD CONSTRAINT `purchase_order_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`id`);

--
-- Constraints for table `purchase_order_item`
--
ALTER TABLE `purchase_order_item`
  ADD CONSTRAINT `purchase_order_item_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_order` (`id`),
  ADD CONSTRAINT `purchase_order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

--
-- Constraints for table `purchase_product`
--
ALTER TABLE `purchase_product`
  ADD CONSTRAINT `purchase_product_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  ADD CONSTRAINT `purchase_product_ibfk_2` FOREIGN KEY (`purchase_id`) REFERENCES `purchase` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
