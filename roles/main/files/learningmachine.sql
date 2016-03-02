CREATE DATABASE  IF NOT EXISTS `learningmachine` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `learningmachine`;
-- MySQL dump 10.13  Distrib 5.5.46, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: learningmachine
-- ------------------------------------------------------
-- Server version	5.5.46-0ubuntu0.14.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attempts`
--

DROP TABLE IF EXISTS `attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score` int(11) DEFAULT NULL,
  `when_attempted` timestamp NULL DEFAULT NULL,
  `exercise_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exercise_id` (`exercise_id`),
  CONSTRAINT `attempts_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attempts`
--

LOCK TABLES `attempts` WRITE;
/*!40000 ALTER TABLE `attempts` DISABLE KEYS */;
INSERT INTO `attempts` VALUES (20,3,'2016-01-06 23:29:39',11),(21,2,'2016-01-06 23:35:08',11),(22,1,'2016-01-06 23:38:08',12),(23,2,'2016-01-06 23:40:36',13),(24,3,'2016-01-07 14:10:47',14),(25,3,'2016-01-18 22:12:39',21),(26,3,'2016-01-18 22:14:42',22),(27,3,'2016-01-18 23:36:57',23),(28,2,'2016-01-19 00:30:31',24),(29,2,'2016-01-22 23:48:11',27),(30,2,'2016-01-24 23:57:13',28),(31,3,'2016-01-25 16:39:38',29),(32,1,'2016-02-21 02:44:26',34),(33,2,'2016-02-21 14:10:24',13),(34,3,'2016-02-21 14:23:51',36),(35,2,'2016-02-21 14:30:36',13),(36,2,'2016-02-21 14:31:03',37),(37,2,'2016-02-21 14:49:40',11),(38,2,'2016-02-21 14:54:36',14),(39,2,'2016-02-21 14:55:05',38),(40,2,'2016-02-25 19:15:42',13),(41,2,'2016-02-25 23:31:34',11),(42,2,'2016-02-27 18:13:28',24),(43,2,'2016-02-27 18:14:53',22),(44,3,'2016-02-27 18:17:26',39);
/*!40000 ALTER TABLE `attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_deletions`
--

DROP TABLE IF EXISTS `exercise_deletions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise_deletions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exercise_id` int(11) DEFAULT NULL,
  `deletion_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exercise_id` (`exercise_id`),
  CONSTRAINT `exercise_deletions_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_deletions`
--

LOCK TABLES `exercise_deletions` WRITE;
/*!40000 ALTER TABLE `exercise_deletions` DISABLE KEYS */;
INSERT INTO `exercise_deletions` VALUES (1,11,'2016-03-01 21:32:34'),(2,38,'2016-03-01 22:46:59'),(3,12,'2016-03-02 01:06:06'),(4,39,'2016-03-02 01:06:15');
/*!40000 ALTER TABLE `exercise_deletions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` text,
  `answer` text,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (11,'Write a simple function based decorator.','How did it go?','cotejrp@gmail.com'),(12,'Write a function based decorator where the decorator takes arguments.','How did it go?  Remember that the decorator is making another decorator and that new one is what wraps the actual target function.','cotejrp@gmail.com'),(13,'Write a custom metaclass and use it to intervene with creation of an actual class.','How did it go?  Did you have a prepare method for a custom class dict?  How about a pre-class __new__?  What about an __init__?','cotejrp@gmail.com'),(14,'Write an ansible playbook that performs a looping action against a list of items.','How did it go?  The with_items directive should help you here.','cotejrp@gmail.com'),(15,'Show me an example of a basic \"hello world\" output message in the context of Ansible.','How did it go?  Use debug with the msg attribute by the way.','cotejrp@gmail.com'),(16,'Show me an example usage of the itertools compress function.','How did it go?  Did you understand the usage of this?','cotejrp@gmail.com'),(17,'Demonstrate basic usage of grep against both file contents and piped stream data.','How did it go?','cotejrp@gmail.com'),(18,'Compare grep vs. egrep.  What are the differences?','egrep supports extended regex symbols and metasymbols.  Normal grep does not.','cotejrp@gmail.com'),(19,'Demonstrate a for loop over a list.','How did that go?','cotejrp@gmail.com'),(20,'Add a variable to a playbook and apply it to any task.','How did that work out?','cotejrp@gmail.com'),(21,'Do a text search using a soup object from Beautiful Soup.','How did that work out?','cotejrp@gmail.com'),(22,'Demonstrate how you might make a basic function in BASH.','How did that bash function work out for you?','cotejrp@gmail.com'),(23,'What is the name of the command used on the linux command line to change permissions on a resource?','chmod','cotejrp@gmail.com'),(24,'You set a file with permissions 755.  What does that mean?','It means the owner has read, right, execute.  The owning group has read and execute.  Everyone else has read and execute too.','cotejrp@gmail.com'),(25,'Demonstrate the creation of a basic view in MySQL','How did it go?','cotejrp@gmail.com'),(26,'When is a database table schema considered to be in first normal form?','When all the values in each field are atomic. (each field is a single value)','cotejrp@gmail.com'),(27,'What switch do you use for grep if you want to do a recursive search?','-r','cotejrp@gmail.com'),(28,'What are some ways you know of for changing a mysql password.  Demonstrate.','How did that one go?','cotejrp@gmail.com'),(29,'Show me how you would make a basic operator that becomes available only under specific circumstances.','How did it go?\n\nUse the poll method and have it return a boolean determing whether or not the circumstances for this particular context are met.','cotejrp@gmail.com'),(30,'What would you do if you needed to initialize a blender operator at the time of calling upon it.','How did it go?  Some hints.....\n\n1.  Use invoke.  The evt object should have useful stuff to initialize the op for this execution instance.\n\n2.  end invoke by having it return a call to execute.','cotejrp@gmail.com'),(31,'Are functions first class objects in Python?','Yes','cotejrp@gmail.com'),(32,'Name the four basic CRUD operations.','Create (Insert)\nRetreive (select)\nUpdate (update)\nDestroy (delete)','cotejrp@gmail.com'),(33,'Show me an example of an inheritance hierachy for Python classes','How did that go?','cotejrp@gmail.com'),(34,'Where is Waldo?','I have no clue.','cotejrp@gmail.com'),(35,'Are all men sexist?','no','cotejrp@gmail.com'),(36,'Where am I right now?','At home, sitting in front of my computer.','cotejrp@gmail.com'),(37,'Write a haskell macro','Just kidding.  You don\'t really have to do that.','cotejrp@gmail.com'),(38,'What was thename of that movie with Typer Durden in it?','Fight Club','cotejrp@gmail.com'),(39,'Show me an example of an html page with a header and body to it.','It should look like this....\n\n<html>\n    <head>\n    </head>\n    <body>\n    </body>\n</html>','cotejrp@gmail.com');
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `display_name` text,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cotejrp@gmail.com','Philip Cote');
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

-- Dump completed on 2016-03-01 21:46:22
