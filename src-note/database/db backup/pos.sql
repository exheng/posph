-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2025 at 09:12 AM
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
(22, 'Headphone ', NULL, 1, 1, '2025-06-06 07:56:29');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `tel` varchar(18) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `type` varchar(120) DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` int(11) NOT NULL,
  `order_no` varchar(120) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `paid_amount` decimal(6,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(120) NOT NULL,
  `remark` text DEFAULT NULL,
  `create_by` varchar(120) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_detail`
--

CREATE TABLE `order_detail` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `qty` int(6) DEFAULT 0,
  `price` decimal(6,2) DEFAULT 0.00,
  `discount` decimal(6,2) DEFAULT 0.00,
  `total` decimal(6,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
(6, 20, 'P003', 'Iphone 15 ', 'Apple', 'undefined', 50, 649.00, 0.00, 0, 'iphone15.jpg-1749198362277-95912613', NULL, '2025-06-06 08:26:02'),
(8, 20, 'P007', 'Iphone 15 plus', 'Apple', '256g Ram8g', 50, 749.00, 0.00, 0, '15plus.jpg-1749198445161-582575416', NULL, '2025-06-06 08:27:25'),
(10, 20, 'P009', 'Iphone 16', 'Apple', 'ZA/A 256g Ram8g', 50, 855.00, 0.00, 1, '15plus.jpg-1749198586955-805791052', NULL, '2025-06-06 08:29:46'),
(12, 20, 'P011', 'Iphone 16 pro max', 'Apple', 'X/A 256g Ram8g', 20, 1199.00, 0.00, 1, 'iphone-16-pro-max-desert-titanium.jpg-1749198856062-837912864', NULL, '2025-06-06 08:34:16'),
(14, 20, 'P013', 'Glalaxy S25', 'Samsung', '256GB/12GB', 30, 849.00, 0.00, 1, 'galaxy-s25-blue.jpg-1749199031522-782132134', 'HengZin', '2025-06-06 08:37:11'),
(16, 20, 'P015', 'Galaxy S25 Ultra', 'Samsung', '256GB/12GB', 30, 1199.00, 0.00, 1, 'S25-Ultra-Titanium-Gray.jpg-1749199167057-115811175', 'HengZin', '2025-06-06 08:39:27'),
(18, 20, 'P017', 'Galaxy S25 Ultra', 'Samsung', '256GB/12GB', 30, 1199.00, 0.00, 1, 'S25-Ultra-Titanium-Gray.jpg-1749199208382-164300442', 'HengZin', '2025-06-06 08:40:08'),
(22, 19, 'P019', 'ASUS ROG StrixG16', 'ASUS', 'G614JVR-N3073W Volt-GREEN - i9-14900HX-16GB-1TB-RTX™4060 8GB-16\"FHD-Wi11-2Y', 30, 1499.00, 0.00, 1, 'asusrogstrix.png-1749199813478-603806086', 'HengZin', '2025-06-06 08:50:13'),
(24, 19, 'P023', 'Dell Alienware m16 R2', 'DELL', 'undefined', 10, 2049.00, 0.00, 1, 'dellAlainwear.png-1749280103976-931754368', 'HengZin', '2025-06-07 07:08:23');

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
(27, 'ewterga', 'egaegaw', 'gawg34t', 'wgwgwega4', 'wgwg', NULL, NULL, 'HengZin', '2025-06-05 10:58:41');

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
(22, 2, 'ah heng', 'hoo123@gmail.com', '$2b$10$sszSBdK2MNRvBpo.VMBJrOZhK2//Pz5H7H0IBGkef1T/uaq6TKoo2', 0, 'ffffff', '2025-05-28 07:07:34');

--
-- Indexes for dumped tables
--

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
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_detail`
--
ALTER TABLE `order_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

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
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `tel` (`tel`);

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
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_detail`
--
ALTER TABLE `order_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `expense_ibfk_1` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_type` (`id`);

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  ADD CONSTRAINT `order_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `customer` (`id`),
  ADD CONSTRAINT `order_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `order_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `order_detail`
--
ALTER TABLE `order_detail`
  ADD CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
  ADD CONSTRAINT `order_detail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

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
