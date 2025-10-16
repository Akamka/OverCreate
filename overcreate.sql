-- MySQL dump 10.13  Distrib 8.4.6, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: overcreate
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-a7865b871c474506e0726a495e3cbe56b929c154','i:1;',1760371323),('laravel-cache-a7865b871c474506e0726a495e3cbe56b929c154:timer','i:1760371323;',1760371323),('laravel-cache-f1abd670358e036c31296e66b3b66c382ac00812','i:1;',1759503924),('laravel-cache-f1abd670358e036c31296e66b3b66c382ac00812:timer','i:1759503924;',1759503924);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `utm_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utm_campaign` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `honeypot` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_submissions_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
INSERT INTO `contact_submissions` VALUES (4,'Dmytro','Bashynskyi','bashinskiy05work@gmail.com','+380969901003','/services/motion','motion CTA','dasdasdasdasfasdf',NULL,NULL,NULL,NULL,'172.19.0.1','spam','2025-09-24 16:34:33','2025-09-30 18:12:28'),(5,'test','test','test@gmail.com','12312312425','/services/motion','motion CTA','testttttttttttttttttttttttttttttt',NULL,NULL,NULL,NULL,NULL,'new','2025-09-30 18:31:58','2025-09-30 18:31:58'),(6,'vxsvxc','vxcvxcv','fcsdfhb@gmail.xom','123213123','/','Service CTA','qqqqqqqqqqqqqqqqqqqqqqqq',NULL,NULL,NULL,NULL,NULL,'spam','2025-10-03 17:40:54','2025-10-04 19:33:40'),(7,'test','test','ssss@gmail.com','+380969901003','/','Service CTA','dqwdqdqdwd',NULL,NULL,NULL,NULL,NULL,'new','2025-10-12 12:08:37','2025-10-12 12:08:37'),(8,'test','testt','bashinskiy05work@gmail.com','12312312425','/services/motion','motion CTA','sdasdasdfasdfsdf',NULL,NULL,NULL,NULL,NULL,'new','2025-10-13 16:01:04','2025-10-13 16:01:04');
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` bigint unsigned NOT NULL DEFAULT '0',
  `width` int unsigned DEFAULT NULL,
  `height` int unsigned DEFAULT NULL,
  `duration` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `message_attachments_message_id_foreign` (`message_id`),
  CONSTRAINT `message_attachments_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_attachments`
--

LOCK TABLES `message_attachments` WRITE;
/*!40000 ALTER TABLE `message_attachments` DISABLE KEYS */;
INSERT INTO `message_attachments` VALUES (36,70,'Artboard 5.png','chat/5/2025/10/3c92f220-5ba5-4966-a9ed-a00bdee4a3e6.png','http://127.0.0.1:8080/storage/chat/5/2025/10/3c92f220-5ba5-4966-a9ed-a00bdee4a3e6.png','image/png',151498,1920,1081,NULL,'2025-10-06 20:09:35','2025-10-06 20:09:35'),(37,70,'Artboard 6.png','chat/5/2025/10/f0ac0f45-e3f9-4d26-89b0-141b945408b6.png','http://127.0.0.1:8080/storage/chat/5/2025/10/f0ac0f45-e3f9-4d26-89b0-141b945408b6.png','image/png',196920,1920,1081,NULL,'2025-10-06 20:09:35','2025-10-06 20:09:35'),(38,70,'Artboard 7.png','chat/5/2025/10/1c38fdbc-3cb4-477e-aa42-8ca797e09b43.png','http://127.0.0.1:8080/storage/chat/5/2025/10/1c38fdbc-3cb4-477e-aa42-8ca797e09b43.png','image/png',87134,1920,1080,NULL,'2025-10-06 20:09:35','2025-10-06 20:09:35'),(39,71,'Artboard 6.png','chat/5/2025/10/3044df85-3652-486a-b062-23fda8349a19.png','http://127.0.0.1:8080/storage/chat/5/2025/10/3044df85-3652-486a-b062-23fda8349a19.png','image/png',196920,1920,1081,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(40,71,'Artboard 7.png','chat/5/2025/10/b0154175-1a12-4df1-8d8f-1dfbf3d78b0c.png','http://127.0.0.1:8080/storage/chat/5/2025/10/b0154175-1a12-4df1-8d8f-1dfbf3d78b0c.png','image/png',87134,1920,1080,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(41,71,'Artboard 8.png','chat/5/2025/10/80ceeb10-e122-464a-8fbe-7f5b048019a8.png','http://127.0.0.1:8080/storage/chat/5/2025/10/80ceeb10-e122-464a-8fbe-7f5b048019a8.png','image/png',81168,1920,1081,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(42,71,'Artboard 9 copy.png','chat/5/2025/10/d709e385-4247-4e2d-9e01-9e668d2b68e2.png','http://127.0.0.1:8080/storage/chat/5/2025/10/d709e385-4247-4e2d-9e01-9e668d2b68e2.png','image/png',154740,1920,1080,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(43,71,'Artboard 9.png','chat/5/2025/10/342804b9-56ea-4c52-a4af-2738dbc79556.png','http://127.0.0.1:8080/storage/chat/5/2025/10/342804b9-56ea-4c52-a4af-2738dbc79556.png','image/png',149836,1920,1080,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(44,71,'Artboard 13.png','chat/5/2025/10/309bae82-fa37-47f9-9c9b-ce11d6b83d24.png','http://127.0.0.1:8080/storage/chat/5/2025/10/309bae82-fa37-47f9-9c9b-ce11d6b83d24.png','image/png',149877,2079,1215,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(45,71,'Artboard 14 copy.png','chat/5/2025/10/e5450558-9427-4073-a97c-39482c725475.png','http://127.0.0.1:8080/storage/chat/5/2025/10/e5450558-9427-4073-a97c-39482c725475.png','image/png',127878,1920,1081,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(46,71,'Artboard 14.png','chat/5/2025/10/bd7900ac-764b-496b-9ddd-213bc816242a.png','http://127.0.0.1:8080/storage/chat/5/2025/10/bd7900ac-764b-496b-9ddd-213bc816242a.png','image/png',136458,1920,1081,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(47,71,'Stream end.png','chat/5/2025/10/4f4df39e-cc6c-4a4d-bdab-75d1b71bae3a.png','http://127.0.0.1:8080/storage/chat/5/2025/10/4f4df39e-cc6c-4a4d-bdab-75d1b71bae3a.png','image/png',224979,1920,1080,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48'),(48,71,'Stream start.png','chat/5/2025/10/d9e9b11f-8b9e-4a51-b1a9-c2bb5353ad16.png','http://127.0.0.1:8080/storage/chat/5/2025/10/d9e9b11f-8b9e-4a51-b1a9-c2bb5353ad16.png','image/png',232933,1920,1080,NULL,'2025-10-06 20:09:48','2025-10-06 20:09:48');
/*!40000 ALTER TABLE `message_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_project_id_foreign` (`project_id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  CONSTRAINT `messages_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (69,5,14,'hi','2025-10-06 20:09:18','2025-10-06 20:09:18'),(70,5,14,'','2025-10-06 20:09:33','2025-10-06 20:09:33'),(71,5,14,'','2025-10-06 20:09:47','2025-10-06 20:09:47'),(72,5,17,'Hello','2025-10-12 11:38:49','2025-10-12 11:38:49'),(73,5,14,'sss','2025-10-12 11:38:57','2025-10-12 11:38:57'),(74,5,17,'ssssss','2025-10-12 12:10:32','2025-10-12 12:10:32');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_08_29_123953_create_portfolios_table',1),(5,'2025_09_02_125100_create_orders_table',1),(6,'2025_09_16_171606_create_contact_submissions_table',1),(7,'2025_09_17_145620_create_personal_access_tokens_table',1),(8,'2025_09_17_145702_add_role_to_users_table',1),(9,'2025_09_17_145705_create_projects_table',1),(10,'2025_09_17_145710_create_messages_table',1),(11,'2025_01_01_000000_create_password_reset_tokens_table',2),(12,'2025_09_18_000001_create_message_attachments_table',3),(13,'2025_09_30_000001_harden_service_type_enum_on_portfolios',4),(14,'2025_10_01_000000_add_status_to_contact_submissions',5),(15,'2025_10_02_000000_add_dates_to_projects',6);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `is_new` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('05bashinskiy05@gmail.com','$2y$12$fTwRH8ntwrCae7N9S2akSegry6.wqmsndyX/hVHIXFL1MHdm6inG.','2025-10-03 11:53:49');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'web','bf1cdf5963c7c8782c47aa9e36140b424eb5ea876fc2f4d9dd6d4d123706cf20','[\"*\"]','2025-09-17 20:13:30',NULL,'2025-09-17 20:00:55','2025-09-17 20:13:30'),(2,'App\\Models\\User',1,'web','6766a9a920be9aac421c75562706c905fdf82157cbc228ca13b3d91354b67bdd','[\"*\"]','2025-09-17 20:26:03',NULL,'2025-09-17 20:23:11','2025-09-17 20:26:03'),(3,'App\\Models\\User',2,'web','83633fd1e2aec70076dd833050d827cb4c5e922f69d16340afa7d3a7353f5247','[\"*\"]','2025-09-17 20:32:41',NULL,'2025-09-17 20:26:11','2025-09-17 20:32:41'),(4,'App\\Models\\User',3,'auth','78303a0eae342335623c19fb00d6c5363093a03e28a9ef4f5e414df7fd1a6b9e','[\"*\"]','2025-09-17 20:33:42',NULL,'2025-09-17 20:33:27','2025-09-17 20:33:42'),(5,'App\\Models\\User',2,'auth','81089cad153a7ad4ba4dcd30536ee248c785a742665dbaef073f21de5257f259','[\"*\"]','2025-09-17 20:34:15',NULL,'2025-09-17 20:34:04','2025-09-17 20:34:15'),(6,'App\\Models\\User',3,'auth','840f6105fc2bf4b9cf5d8a25ac1585c2988275b7d1eee5e03f862120e1ea8160','[\"*\"]','2025-09-17 20:35:16',NULL,'2025-09-17 20:34:28','2025-09-17 20:35:16'),(7,'App\\Models\\User',2,'auth','020ee8621779278512c16fc3792a31409957fb8e42905614b337da0d69300c6a','[\"*\"]','2025-09-17 20:35:32',NULL,'2025-09-17 20:35:24','2025-09-17 20:35:32'),(8,'App\\Models\\User',1,'auth','9d9d6fc242dab2a4c0bd0203232753a491fe1ae23500e0f75bd9f01c854f55da','[\"*\"]','2025-09-17 20:40:19',NULL,'2025-09-17 20:35:53','2025-09-17 20:40:19'),(9,'App\\Models\\User',1,'auth','4b13d9e9f1e946ba3995e409f3149d78098ccec9fbbe08972b7e0e50b2be63f8','[\"*\"]','2025-09-17 20:40:30',NULL,'2025-09-17 20:40:27','2025-09-17 20:40:30'),(10,'App\\Models\\User',1,'auth','f92f9a72cb122521bcf82dc684cb61ed01ad33fb554c0581c2a0fe37bbd47ff2','[\"*\"]',NULL,NULL,'2025-09-17 20:40:27','2025-09-17 20:40:27'),(11,'App\\Models\\User',2,'auth','c5abae49967609f3df94356e0319ffb7bbad31bae4712603a1f4b0653a880766','[\"*\"]','2025-09-17 20:45:15',NULL,'2025-09-17 20:40:35','2025-09-17 20:45:15'),(12,'App\\Models\\User',3,'auth','75b4328c7fc8ac0c5305a00f1bdfb6c552b711561ce13f1e21169c175fcd8b8b','[\"*\"]','2025-09-18 15:31:45',NULL,'2025-09-17 20:45:17','2025-09-18 15:31:45'),(13,'App\\Models\\User',2,'auth','95d5012895916d172454049b1f5e90afefcf94ebdc225635de8b69c571ed84db','[\"*\"]','2025-09-18 15:31:45',NULL,'2025-09-17 20:46:01','2025-09-18 15:31:45'),(15,'App\\Models\\User',2,'auth','83b5cdcacb083f25483767b2756e877d8854e5dcd68aea169e09fccb9a9f5325','[\"*\"]','2025-09-18 15:32:25',NULL,'2025-09-17 20:57:21','2025-09-18 15:32:25'),(16,'App\\Models\\User',2,'auth','99dc6f996cc52bc36cf632a4e3505c918cce5c23d8a3aa8737bc6702b49d46bf','[\"*\"]','2025-09-18 15:32:21',NULL,'2025-09-17 21:07:08','2025-09-18 15:32:21'),(17,'App\\Models\\User',2,'auth','fffb6657e4de62d2baacfdaa13293df184a0def7bb932388d5ab218528cbb32c','[\"*\"]','2025-09-19 08:01:44',NULL,'2025-09-19 07:55:41','2025-09-19 08:01:44'),(19,'App\\Models\\User',1,'auth','5a310ff1dd6f2a39798553955a3c2b9d076b72bbdccfbe595b2f08125477a104','[\"*\"]','2025-09-19 08:11:45',NULL,'2025-09-19 08:02:39','2025-09-19 08:11:45'),(21,'App\\Models\\User',4,'auth','279ce78d7883d50350c97fc3f270a1dea958bbd5a03fddb6c697ee63b711773d','[\"*\"]','2025-09-19 09:38:44',NULL,'2025-09-19 09:16:06','2025-09-19 09:38:44'),(22,'App\\Models\\User',5,'auth','573614cd30fece73783a120d0351f797c52559b93faacc633f1a4bbf18140db7','[\"*\"]',NULL,NULL,'2025-09-19 09:39:38','2025-09-19 09:39:38'),(25,'App\\Models\\User',8,'auth','396a39730cf2a3ebf562bf88ee9970c0685ca2e2bcd59c389159cd25060df4ee','[\"*\"]','2025-09-19 11:09:17',NULL,'2025-09-19 10:11:45','2025-09-19 11:09:17'),(26,'App\\Models\\User',9,'auth','9fc9b58f9b040c97f960a37ba804ac59435b8ae0f206ffabe95561409214a207','[\"*\"]','2025-09-19 11:11:58',NULL,'2025-09-19 11:09:47','2025-09-19 11:11:58'),(27,'App\\Models\\User',9,'auth','932a9c8c9f24f29eed4690f892ff41c8be8e2c49354dc5dee4933d985df635a7','[\"*\"]',NULL,NULL,'2025-09-19 11:12:05','2025-09-19 11:12:05'),(28,'App\\Models\\User',10,'auth','8af861269b949a1c8a0fe187510baa33efe9c328133f1c99ad0858e75b45b4b8','[\"*\"]',NULL,NULL,'2025-09-19 11:18:54','2025-09-19 11:18:54'),(29,'App\\Models\\User',11,'auth','9380bea63f71bdf108978f4ab8a32a09f78b6ede9f7130f1893f16fdfdbb3413','[\"*\"]',NULL,NULL,'2025-09-19 12:08:17','2025-09-19 12:08:17'),(30,'App\\Models\\User',12,'auth','22ccdfcabee302330142e232dc4d163599a9a6b24a120f516c077696cd617716','[\"*\"]','2025-09-19 12:26:23',NULL,'2025-09-19 12:13:46','2025-09-19 12:26:23'),(31,'App\\Models\\User',13,'auth','a8288de00dc508d1cae74aaff87fdbf347a8dcd8d285a7cf3651ef6011cf3586','[\"*\"]','2025-09-19 13:36:25',NULL,'2025-09-19 13:36:09','2025-09-19 13:36:25'),(32,'App\\Models\\User',13,'auth','fb3c81440b56f1a16b141f1c99009e08be5365ab07bccf23a74cb79ce1dfa330','[\"*\"]','2025-09-19 13:36:33',NULL,'2025-09-19 13:36:32','2025-09-19 13:36:33'),(33,'App\\Models\\User',13,'auth','bcc429b2f62390fd9630d159b90956a86a0ae8f08a082d458f0ef81bff6a87da','[\"*\"]','2025-09-19 13:36:37',NULL,'2025-09-19 13:36:36','2025-09-19 13:36:37'),(34,'App\\Models\\User',13,'auth','803dbce75436546fa09400a2bca4186c4f392f6fbad15ebab3a29d5fa7018395','[\"*\"]','2025-09-19 13:36:52',NULL,'2025-09-19 13:36:52','2025-09-19 13:36:52'),(35,'App\\Models\\User',1,'auth','ae6ab32a07b0cb86b2e319d6f6ff662a8c8804c496605c885bcc22c49b6ff30e','[\"*\"]','2025-09-19 13:37:03',NULL,'2025-09-19 13:36:59','2025-09-19 13:37:03'),(36,'App\\Models\\User',13,'auth','37bb0dfcfdbd489952117e8e27c38f8cd58742bc2b6689f70725512676dd7285','[\"*\"]','2025-09-19 13:37:07',NULL,'2025-09-19 13:37:06','2025-09-19 13:37:07'),(37,'App\\Models\\User',13,'auth','d4d192eb3db1baf33903c9c4627cad455242f14fdd69bd75455b600c68e6c884','[\"*\"]','2025-09-19 13:42:06',NULL,'2025-09-19 13:42:05','2025-09-19 13:42:06'),(38,'App\\Models\\User',13,'auth','dfa4c75bd1edffa0efeb896b956cf46e7308010b1147c3757d40e1749e50bfc5','[\"*\"]','2025-09-19 13:42:12',NULL,'2025-09-19 13:42:11','2025-09-19 13:42:12'),(39,'App\\Models\\User',13,'auth','6c9927b5391e19a2eeec21ecf71cc3ff00819ee00650a7118a5ad275dcf7f19d','[\"*\"]','2025-09-19 13:51:34',NULL,'2025-09-19 13:51:33','2025-09-19 13:51:34'),(40,'App\\Models\\User',13,'auth','37a395737441c05b444b88ce2b593ad051a96004e9b48c2dc86d3c56ef612175','[\"*\"]','2025-09-19 13:51:43',NULL,'2025-09-19 13:51:43','2025-09-19 13:51:43'),(41,'App\\Models\\User',13,'auth','7f39c60b6ac59469376777cc2ee8f098a52c01b9db80bf90484af8809bebc507','[\"*\"]','2025-09-19 13:51:50',NULL,'2025-09-19 13:51:49','2025-09-19 13:51:50'),(42,'App\\Models\\User',13,'auth','57c1e1910b04f9113503f639638f99c4369a4b304dd9befc216bfa29db3fb972','[\"*\"]','2025-09-19 13:52:58',NULL,'2025-09-19 13:52:57','2025-09-19 13:52:58'),(43,'App\\Models\\User',2,'auth','3e8e55cf8f675738d7f0abe460434134e98838d26aeab5b8f7d69da0ce213abc','[\"*\"]',NULL,NULL,'2025-09-19 13:53:07','2025-09-19 13:53:07'),(44,'App\\Models\\User',13,'auth','436e56150ea77a7e1059e1caf967b04206c54152148f6febb508f5b6914e8b55','[\"*\"]','2025-09-19 14:04:04',NULL,'2025-09-19 13:59:06','2025-09-19 14:04:04'),(45,'App\\Models\\User',14,'auth','9be6c87862ae9872117769907be0a50a7e29f5ff26d5e21540b124b79c3f4c58','[\"*\"]','2025-09-19 14:10:14',NULL,'2025-09-19 14:00:08','2025-09-19 14:10:14'),(46,'App\\Models\\User',14,'auth','a47f4b6b310e2fc64ce36c9f742d4bf4a641bfed6e8b08a1ac732ff887fa1004','[\"*\"]','2025-09-19 14:22:17',NULL,'2025-09-19 14:14:56','2025-09-19 14:22:17'),(47,'App\\Models\\User',13,'auth','0d06cdb06ec19d8c84330cd8d7937e3a137fec5a39bb5e68a644f4e621cf503d','[\"*\"]','2025-09-19 14:28:47',NULL,'2025-09-19 14:15:04','2025-09-19 14:28:47'),(48,'App\\Models\\User',13,'auth','c90467b3d7e225bac4c0fab8f6a0768768e4506f14dec4bcea1a84daebae69d5','[\"*\"]','2025-09-19 14:22:27',NULL,'2025-09-19 14:22:26','2025-09-19 14:22:27'),(49,'App\\Models\\User',13,'auth','197ce16cdb6892c7d255eb5a9809caf1412e2348e5063559fe15583e4d8f6d11','[\"*\"]','2025-09-19 14:35:56',NULL,'2025-09-19 14:28:14','2025-09-19 14:35:56'),(50,'App\\Models\\User',13,'auth','c9ddabf0203fb79e29faf4eeb2a7e6afa780bc10cfdb9d8ef36373408aee6b97','[\"*\"]','2025-09-19 15:10:11',NULL,'2025-09-19 15:10:10','2025-09-19 15:10:11'),(51,'App\\Models\\User',13,'auth','57f0bba5a84a0c0bb4f397f590f8e8ec5815ed83aa4215e5d1c741668928e914','[\"*\"]','2025-09-20 09:00:44',NULL,'2025-09-20 09:00:43','2025-09-20 09:00:44'),(52,'App\\Models\\User',14,'auth','2a9a7dffbe95045c3094ffa5a45ec1677da59cb15416c74c7b12ff9f60c3a61e','[\"*\"]','2025-09-20 21:15:57',NULL,'2025-09-20 09:01:05','2025-09-20 21:15:57'),(53,'App\\Models\\User',13,'auth','730185682fdc7c838616e739af4dfca2995e7731690f42c1d05cc9c77f4e8a8a','[\"*\"]','2025-09-20 21:23:36',NULL,'2025-09-20 09:01:23','2025-09-20 21:23:36'),(54,'App\\Models\\User',13,'auth','3f2eed420af636cc5cf2cfeffd4e92c91fd953c89d6d37934a77a554399a3133','[\"*\"]',NULL,NULL,'2025-09-20 17:12:44','2025-09-20 17:12:44'),(55,'App\\Models\\User',13,'auth','aa5e18eba1aed14029631f8cc56e8ac910abe25df62c8ba5561dd970684329dc','[\"*\"]','2025-09-20 21:30:52',NULL,'2025-09-20 21:27:44','2025-09-20 21:30:52'),(56,'App\\Models\\User',14,'auth','cb923844ee05d62c5047bd6f8b5c125a53e9a4331c92c6551a69d90f7bbb08af','[\"*\"]','2025-09-20 21:30:25',NULL,'2025-09-20 21:30:03','2025-09-20 21:30:25'),(57,'App\\Models\\User',14,'auth','459a383961a4e4597115ee7ea41a16568d3ef3744101738807707fb0a1ceac1a','[\"*\"]','2025-09-21 15:35:06',NULL,'2025-09-21 15:32:01','2025-09-21 15:35:06'),(58,'App\\Models\\User',13,'auth','029bcbab0ce95046c26e26a1b16fd63c9829e64a9293227f336bc3a9e0a51af8','[\"*\"]','2025-09-21 15:34:01',NULL,'2025-09-21 15:32:06','2025-09-21 15:34:01'),(60,'App\\Models\\User',14,'auth','8e7ee0acaf39c8e1d75a56c27fb16e88610124a3a7fa008b0e7d6124b8cb0709','[\"*\"]','2025-09-24 16:31:33',NULL,'2025-09-24 16:30:29','2025-09-24 16:31:33'),(61,'App\\Models\\User',13,'auth','69d7fd50591726cd40efbab080897bc824390df68f5d974a0ba1537c3409a212','[\"*\"]','2025-09-24 16:32:38',NULL,'2025-09-24 16:30:38','2025-09-24 16:32:38'),(63,'App\\Models\\User',14,'auth','c90a1eb88871964f0b511df12164432373861bb0b3f31e2f984bc89580095ac5','[\"*\"]','2025-09-30 21:41:03',NULL,'2025-09-30 20:27:21','2025-09-30 21:41:03'),(64,'App\\Models\\User',13,'auth','a64889fac0ede9de483a6dc8f37147edb66c26c1323b0578ad9d00b841f79aab','[\"*\"]','2025-09-30 21:46:04',NULL,'2025-09-30 20:30:32','2025-09-30 21:46:04'),(65,'App\\Models\\User',13,'auth','522e6afacee45c7dc2f193e20ddc9f30fea2f83376a1546c7231ee3843b77de0','[\"*\"]','2025-10-01 17:52:45',NULL,'2025-10-01 11:30:13','2025-10-01 17:52:45'),(66,'App\\Models\\User',14,'auth','aec37c75894814fd55aba195d618383aaa729413d65a58e48a70cb080d4a0b91','[\"*\"]','2025-10-01 15:51:31',NULL,'2025-10-01 12:45:42','2025-10-01 15:51:31'),(67,'App\\Models\\User',13,'auth','da29e3066bae00c7cdda1f7c34ca897606c6c3a8333021c3617bbac699eba0a7','[\"*\"]','2025-10-03 00:00:07',NULL,'2025-10-02 14:36:13','2025-10-03 00:00:07'),(68,'App\\Models\\User',14,'auth','f45f7e94812fbcab6beabd9e95e08a37bb7db324eccbf0ad0f6f5fd0fc9f69f1','[\"*\"]','2025-10-03 00:00:03',NULL,'2025-10-02 14:39:33','2025-10-03 00:00:03'),(69,'App\\Models\\User',13,'auth','95243b2fc95af56618caeb73e99c6c25cc15d4104e5e54c40213a04575a0165a','[\"*\"]','2025-10-03 11:40:27',NULL,'2025-10-03 11:40:25','2025-10-03 11:40:27'),(73,'App\\Models\\User',14,'auth','fcbf83e9b137e660a3db9f421db132b4b61f629e2e50d1a0ebc3600d2c133195','[\"*\"]','2025-10-03 14:33:14',NULL,'2025-10-03 14:33:14','2025-10-03 14:33:14'),(75,'App\\Models\\User',16,'auth','d0e6df4caf0e72fe1abc7b8604b56647cd9839258c378b80f24b67040f7a3d65','[\"*\"]','2025-10-03 15:06:43',NULL,'2025-10-03 15:06:07','2025-10-03 15:06:43'),(77,'App\\Models\\User',17,'auth','f7f20ce6b301c4fd34c479da24353d565abf7a0015ef1819bde6d8d390415a4d','[\"*\"]','2025-10-03 20:45:46',NULL,'2025-10-03 18:37:26','2025-10-03 20:45:46'),(80,'App\\Models\\User',17,'auth','edcffcd76a8b01d86ae180f533eb5a0d4e9a92dd1c14df4308c17c9856734ad6','[\"*\"]','2025-10-06 20:10:58',NULL,'2025-10-06 20:10:58','2025-10-06 20:10:58'),(82,'App\\Models\\User',14,'auth','6fcd0f36cded1ab6c70772e53fdd771f9b1d82b9812bef7d8211c6845e84f683','[\"*\"]','2025-10-12 12:16:18',NULL,'2025-10-12 11:38:32','2025-10-12 12:16:18');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('web','motion','graphic','dev','printing') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `cover_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `client` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `body` longtext COLLATE utf8mb4_unicode_ci,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `portfolios_slug_unique` (`slug`),
  KEY `portfolios_service_type_index` (`service_type`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolios`
--

LOCK TABLES `portfolios` WRITE;
/*!40000 ALTER TABLE `portfolios` DISABLE KEYS */;
INSERT INTO `portfolios` VALUES (1,'Alliance motion test','alliance-motion-test-1or0ey','motion','http://localhost:8080/storage/portfolio/DrUIWjT7loQM3SvPcEoa0Ca87iJTMghPewXxEjIh.png','[\"http://localhost:8080/storage/portfolio/2VayyGIKDd3ProsFHV1Xb5QNnGkS1wXY5AkH9AB4.mp4\"]',NULL,'motion, logo','Alliance motion test desc',NULL,1,0,1,NULL,NULL,'2025-09-21 15:01:25','2025-09-26 08:38:37','2025-09-26 08:38:37'),(2,'Graphic test 1','graphic-test-1-rqL2t5','graphic','http://localhost:8080/storage/portfolio/ZhMhUtIihFPtX3QtUlGTm7dG1sXqWqqdOxyKnBoR.png','[\"http://localhost:8080/storage/portfolio/XMnmJ4oaNbAZn9a7lPQQ1Ikq8eVg3jJiAbiYUuAK.png\"]',NULL,'Logo','Graphic test 1 desc',NULL,1,0,1,NULL,NULL,'2025-09-21 15:09:06','2025-09-21 15:09:06',NULL),(3,'ttttttttt','ttttttttt-P0avww','motion','http://localhost:8080/storage/portfolio/MZruP6tL4iUGYoi6zVzEMSBDEX9UvqwjnjzpwAvO.png','[\"http://localhost:8080/storage/portfolio/uhIlQynUj42LAgRCq7krVxloKEGkQmzdOTIYOowx.png\", \"http://localhost:8080/storage/portfolio/aNrM5GZQAYC9CNYZzBDw0WbwCdEqi1aPngkA8T7E.png\"]',NULL,'tttttttt','ttttttttttt',NULL,1,0,2,NULL,NULL,'2025-09-24 19:14:20','2025-09-26 08:38:39','2025-09-26 08:38:39'),(4,'ttttttttt','ttttttttt-8oqi97','motion','http://localhost:8080/storage/portfolio/6pHQ9ANTe7e0Bz2qoSnMrl6Bszgc5xxAYrAdjDWX.png','[\"http://localhost:8080/storage/portfolio/v50Fs3WIqR0vQOYPLhWHlRERQrXVAHl873bM4OUE.png\", \"http://localhost:8080/storage/portfolio/5iUWbIuiPzVF7KFMWozBMJx5sRnGQosKJKNQMK7j.png\", \"http://localhost:8080/storage/portfolio/v95maXUfRllYa6yZOVCITwEBFufv13CwqSr065ap.png\"]',NULL,NULL,'tttttttttttt',NULL,1,0,3,NULL,NULL,'2025-09-24 19:15:52','2025-09-24 19:15:52',NULL),(5,'tttttttttttt','tttttttttttt-LUV0Nv','motion','http://localhost:8080/storage/portfolio/ABgOBvGIQfYnigqrm7okSxopefxptgydLWSW9171.jpg','[\"http://localhost:8080/storage/portfolio/Ih6Gau2Jl78BVUf2012WFMr3UNCsQAwj5TnT6ttV.png\"]',NULL,'tttttttttttt','ttttttttttttt',NULL,1,0,4,NULL,NULL,'2025-09-24 19:16:40','2025-09-24 19:16:40',NULL),(6,'ttttttttttttt','ttttttttttttt-5ZinKh','graphic','http://localhost:8080/storage/portfolio/vS8SyBoLjDiHMmY0pB064UIHX1giSAmYXKeUbzsd.png','[\"http://localhost:8080/storage/portfolio/iU7E4frhmWHojv7ZoYWTicTl4j7eCTWK29OXSTXE.png\"]',NULL,'tttttt, tttttttttttt','ttttttttt',NULL,1,0,2,NULL,NULL,'2025-09-25 18:12:49','2025-09-25 18:12:49',NULL),(7,'tttttttttt','tttttttttt-NXTDYg','graphic','http://localhost:8080/storage/portfolio/UMzNKGCd2v6awRiBHoum4clgreVf27ZbwGRST3Sm.png','[\"http://localhost:8080/storage/portfolio/ZS8sw7xLZMYXngRJdRC2uDw4k9HEj2VBLlr2r8Og.png\"]',NULL,'tttttttttt','ttttttttttttt',NULL,1,0,3,NULL,NULL,'2025-09-25 18:13:02','2025-09-25 18:13:02',NULL),(8,'кккккккккк','kkkkkkkkkk-pyJsq0','graphic','http://localhost:8080/storage/portfolio/14NEXwzzKclTAWb8BjijXdHXJMK5vgknPFZmMVJa.png','[\"http://localhost:8080/storage/portfolio/yJIHfWa1DmEoSu2Flo08cPLGo0KQdv9rcIXs26rV.png\"]',NULL,'кккккккккккккк','ккккккккккк',NULL,1,0,3,NULL,NULL,'2025-09-26 07:35:54','2025-09-26 07:35:54',NULL),(9,'кккккккк','kkkkkkkk-yXp47b','web','http://localhost:8080/storage/portfolio/VIC4c9xiKEzpA2Lo8zEjOterdIQYQSyITplndIyM.png','[\"http://localhost:8080/storage/portfolio/cZZTduDaaQZwy7oKcz00Djkq8WbbUMeZIKYyLE2v.png\"]',NULL,'ккк','кккккккк',NULL,1,0,0,NULL,NULL,'2025-09-26 07:36:10','2025-09-26 07:56:55','2025-09-26 07:56:55'),(10,'еееееееее','eeeeeeeee-vQEuHt','web','http://localhost:8080/storage/portfolio/KD79blxtjU9FLWOECNzcjLeutyivN7PkJLIEoeSF.png','[\"http://localhost:8080/storage/portfolio/e7BNfPywqSlQQMFnn2XQk2EKBtGCeXiFN74rdEoR.png\"]',NULL,'уууу','еееееее',NULL,1,0,3,NULL,NULL,'2025-09-26 07:37:12','2025-09-26 07:37:12',NULL),(11,'нннн','nnnn-0hIA5g','motion','http://localhost:8080/storage/portfolio/EuStlMR82Y5Q8weY6rqSQkaNk1PK05jdIfA6Nrxb.png','[\"http://localhost:8080/storage/portfolio/n9Hx5Xut8vnir3U6y4JjYEU9bfdUIQRzZ7wI85QM.png\"]',NULL,'ккк','нннннннннн',NULL,1,0,3,NULL,NULL,'2025-09-26 07:54:52','2025-09-26 07:54:52',NULL),(12,'ццц','ccc-W5l4ch','web','http://localhost:8080/storage/portfolio/1dBfO0LIag5VVTF89P4iokoZYs8eXWjIGg8l1uL7.png','[\"http://localhost:8080/storage/portfolio/suyTuxPaWMNXwBL2uNwHtaZSeEA8PgvIIdDQ1kw5.png\"]',NULL,'ццц','цццц',NULL,1,0,0,NULL,NULL,'2025-09-26 07:56:22','2025-09-26 08:20:56','2025-09-26 08:20:56'),(13,'оооооооо','oooooooo-OHIycF','motion','http://localhost:8080/storage/portfolio/ap4uU1Rg45D6ssaj9Gmea7FpSm1vXRgqwJVdUxSl.png','[\"http://localhost:8080/storage/portfolio/fg42jgmEMVnUd6fuDTxQfQEgB00A8hVmWzXOaNaB.png\"]',NULL,'оооо','ооооооо',NULL,1,0,0,NULL,NULL,'2025-09-26 08:00:51','2025-09-26 08:38:33','2025-09-26 08:38:33'),(14,'Test web 1','test-web-1-c5VQXa','motion','http://localhost:8080/storage/portfolio/93LXu7G8vej08lSsNwMgt9ZOhJr2nv0gfcnpgy6q.png','[\"http://localhost:8080/storage/portfolio/Z1FuoOygBLNJAMtbDiLL3R7pfBBXqjvs45ALkZuM.png\"]',NULL,'eqwe','eqewqe',NULL,1,0,1,NULL,NULL,'2025-09-26 08:21:26','2025-09-26 08:38:34','2025-09-26 08:38:34'),(15,'Test web 2','test-web-2-knOee3','web','http://localhost:8080/storage/portfolio/AMdaIYmK3HbvgcRWA019ed1Snqv664Mkc8LUIJFT.png','[\"http://localhost:8080/storage/portfolio/UK7cc0WyEDypLyN9BlLkoZ9BBguZwlYxwQGgZcfM.png\"]',NULL,'qweqwe','eqweq',NULL,1,0,2,NULL,NULL,'2025-09-26 08:22:10','2025-09-26 08:22:10',NULL),(16,'Test web 3','test-web-3-fTrzhV','web','http://localhost:8080/storage/portfolio/bivQ4zX0NSn4kyritLawnecSq5dfVgEvrNbMMX6g.png','[\"http://localhost:8080/storage/portfolio/r9sjNYwfDYTbEX12Lhw1gneHLTYcC0beQ2B0jwoE.png\"]',NULL,'qweqwe','eqwe',NULL,1,0,1,NULL,NULL,'2025-09-26 08:22:45','2025-09-26 08:23:06',NULL),(17,'ooooooo','ooooooo-GaOnOs','motion','http://localhost:8080/storage/portfolio/MDFYh8nqIodzIadDapRCG5RTVCZe3dIvuMwScWvx.png','[\"http://localhost:8080/storage/portfolio/Gp9Xm3gDdK4nsKx0BplStp73SQ3iBMtKPpqClJC2.png\"]',NULL,'oooooo','oooooooo',NULL,1,0,4,NULL,NULL,'2025-09-28 16:04:10','2025-09-28 16:04:10',NULL),(18,'qqqqqqqqqqqq','qqqqqqqqqqqq-5TvYma','motion','http://localhost:8080/storage/portfolio/Af2T4fuxzHI3HIpVHskaCtDiP1c22bi6BCf4Kr2Y.png','[\"http://localhost:8080/storage/portfolio/PEADeGd26WHeJPElfOluokzdhGQgviieUZxZbET8.png\"]',NULL,'qqq','qqqqqqqqqqqq',NULL,1,0,0,NULL,NULL,'2025-09-28 19:40:43','2025-09-30 15:44:09','2025-09-30 15:44:09'),(19,'test','test-wH5bMa','dev','http://localhost:8080/storage/portfolio/KtlQs2iISaCbP0WBtHQ0cYWlUmYg6xF4oAAq2vMZ.png','[\"http://localhost:8080/storage/portfolio/UuJK3iQ6jEDjJnKZIdpfx4obaiikqAw15UjLGjBD.png\"]',NULL,'test','test',NULL,1,0,1,NULL,NULL,'2025-09-28 19:47:27','2025-09-28 19:47:27',NULL),(20,'Test web','test-web-WZKoJS','web','http://localhost:8080/storage/portfolio/jrl1fap5SUK9cncvmLIsQwU8xRNSYwOJd0io12ZX.png','[\"http://localhost:8080/storage/portfolio/AihSGA8tJA3rgdsOVk8FMHFLp4EJlyoUSbJjgo2t.png\"]',NULL,'test','test web',NULL,1,0,1,NULL,NULL,'2025-09-28 19:48:41','2025-09-28 19:48:41',NULL),(21,'test motion 6','test-motion-6-Jze0KA','motion','http://localhost:8080/storage/portfolio/bcoPutkXlJuK4ld0OkuOluq20RGyRu9wKOTmxBJS.png','[\"http://localhost:8080/storage/portfolio/r7DVjL61VwDjPBdEaGK6sXlDmUCRktC21kG5Qk5w.png\"]',NULL,'test','test',NULL,1,0,2,NULL,NULL,'2025-09-29 22:08:39','2025-09-29 22:08:39',NULL),(22,'Alliance motion','alliance-motion-StRJcZ','motion','http://localhost:8080/storage/portfolio/C5zuT6yqnxIdMyTTT6NAQ46RyOmrJJP9ASpOFyqo.png','[\"http://localhost:8080/storage/portfolio/pElHRhrk7varsX69DXwOzsWzlLRw9KwuE94JOOon.mp4\"]',NULL,'qq','Alliance motion',NULL,1,0,0,NULL,NULL,'2025-09-30 15:45:09','2025-09-30 15:45:09',NULL),(23,'Web test','web-test-Xb5G3t','web','http://localhost:8080/storage/portfolio/QelcXL2u6Au72YmQ6eKQoIlrMP9uYr2yk5HzeVtP.png','[\"http://localhost:8080/storage/portfolio/YEknj1iTU6qbLuzQJhXlo7Ur8xkxn6Gm3m4DEKjz.mp4\"]',NULL,'www','Web test',NULL,1,0,6,NULL,NULL,'2025-09-30 16:33:44','2025-09-30 16:34:32',NULL);
/*!40000 ALTER TABLE `portfolios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `assignee_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_at` date DEFAULT NULL,
  `due_at` date DEFAULT NULL,
  `status` enum('new','in_progress','review','done','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `progress` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_user_id_foreign` (`user_id`),
  KEY `projects_assignee_id_foreign` (`assignee_id`),
  KEY `projects_status_index` (`status`),
  CONSTRAINT `projects_assignee_id_foreign` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (5,17,14,'Test','Test','2025-10-04','2025-10-10','in_progress',0,'2025-10-04 19:34:48','2025-10-04 19:35:03'),(6,17,14,'test2','wwwwww','2025-10-12','2025-10-14','in_progress',52,'2025-10-12 12:11:08','2025-10-12 12:11:31');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('client','staff','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test Client','client1@example.com',NULL,'$2y$12$j5xGg9fbo1OC3zonXIhvnOXHHc1FFN6DxHZfqNyqDv0V8kHWpnQ06','client',NULL,'2025-09-17 18:17:20','2025-09-17 18:17:20'),(14,'Designer','bashinskiy05work@gmail.com','2025-09-19 14:00:25','$2y$12$9u1f4FvGNUSN09gxr70DguJbQaCY56RErZbo5vPC4o/u6E195hO6y','staff',NULL,'2025-09-19 14:00:08','2025-09-19 14:01:53'),(17,'Dmytro','05bashinskiy05@gmail.com','2025-10-03 15:35:27','$2y$12$f6I6Cx1O8vT/p.QAsQb95ewiJBHqhssRamF.v7ZK1sdrSVJSTlRty','client',NULL,'2025-10-03 15:34:42','2025-10-03 15:35:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 16:46:34
