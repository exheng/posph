CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `description`, `parent_id`, `status`, `create_at`) VALUES
(1, 'Computer', 'Des Computers', NULL, 1, '2024-08-07 14:28:45'),
(2, 'Phone', 'Des Phone', NULL, 1, '2024-08-07 14:31:19'),
(3, 'Monitor', 'Des Monitor', NULL, 1, '2024-08-07 14:32:19'),
(4, 'Test101', 'Des Test 101', NULL, 1, '2024-08-07 14:35:02'),
(5, 'Test102', 'Des Test 102', NULL, 1, '2024-08-07 14:35:02'),
(6, 'Test104', 'Des Test104', NULL, 0, '2024-08-07 14:35:02'),
(8, 'Test105', 'De 104', NULL, 1, '2024-08-12 14:41:16'),
(9, 'Test105', 'De 104', NULL, 1, '2024-08-12 14:42:18'),
(10, 'Test106', 'De 106', NULL, 0, '2024-08-12 14:43:35'),
(11, 'Sok', 'Som', NULL, 1, '2024-08-12 14:53:21'),
(12, 'Printer101', 'Des ', NULL, NULL, '2024-08-12 14:54:53'),
(13, 'Printer102', 'Des ', NULL, NULL, '2024-08-12 14:55:08'),
(15, 'Test update', 'Test update', NULL, 1, '2024-08-12 15:00:42'),
(16, 'Test107', 'Des ', NULL, NULL, '2024-08-15 13:57:30'),
(17, 'Test108', NULL, NULL, NULL, '2024-08-15 14:04:52');