
CREATE TABLE logs (
	id VARCHAR NOT NULL, 
	user_id VARCHAR, 
	action VARCHAR, 
	folder_name VARCHAR, 
	timestamp TIMESTAMP, 
	PRIMARY KEY (id)
);
INSERT INTO logs VALUES('1718775604.005788','edoszhan','Save Role Clicked','role_settings','2024-06-19 05:40:03.998000');
INSERT INTO logs VALUES('1718775607.941615','edoszhan','Inject Threads Clicked','threads_injection','2024-06-19 05:40:07.936000');
INSERT INTO logs VALUES('1718775608.959833','edoszhan','Inject Threads Clicked','threads_injection','2024-06-19 05:40:08.954000');
INSERT INTO logs VALUES('1718775633.09548','edoszhan','Role Changed to L2','role_change','2024-06-19 05:40:33.084000');
INSERT INTO logs VALUES('1718775633.418551','edoszhan','Save Role Clicked','role_settings','2024-06-19 05:40:33.413000');

CREATE TABLE threads (
	id INTEGER NOT NULL, 
	topic VARCHAR, 
	PRIMARY KEY (id)
);
CREATE TABLE reviews (
	id INTEGER NOT NULL, 
	prev_order JSON, 
	new_order JSON, 
	source_id INTEGER, 
	destination_id INTEGER, pending_review BOOLEAN DEFAULT TRUE, accepted_by JSON DEFAULT '[]', denied_by JSON DEFAULT '[]', author VARCHAR(255), timestamp TIMESTAMP, summary TEXT, 
	PRIMARY KEY (id)
);
INSERT INTO reviews VALUES(1,'[15, 16, 17, 18, 19, 20]','[{"text": "this is first statement", "author": "TESTER3", "timestamp": "2024-07-17T01:23:10.566000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "this is second", "author": "TESTER3", "timestamp": "2024-07-17T01:23:14.847000", "upvotes": 0, "children": [], "cluster_id": 18}, {"text": "third third ", "author": "TESTER3", "timestamp": "2024-07-17T01:23:18.525000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "hekki", "author": "gg", "timestamp": "2024-07-17T03:37:31.731000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "hello", "author": "gg", "timestamp": "2024-07-17T03:37:35.114000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "posting new comment", "author": "sss", "timestamp": "2024-07-17T06:59:50.278000", "upvotes": 0, "children": [], "cluster_id": null}]',16,18,0,'["sss", "sssss", "s", "setterrr", "robot", "RIB", "lff", "gggggg", "re"]','[]','sss','2024-07-17 07:42:36.271000','The commenter indicated that their comment was the second one and used a variation of the word "hello."');
INSERT INTO reviews VALUES(2,'[15, 16, 17, 18, 19, 20, 21, 22]','[{"text": "this is first statement", "author": "TESTER3", "timestamp": "2024-07-17T01:23:10.566000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "this is second", "author": "TESTER3", "timestamp": "2024-07-17T01:23:14.847000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "third third ", "author": "TESTER3", "timestamp": "2024-07-17T01:23:18.525000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "hekki", "author": "gg", "timestamp": "2024-07-17T03:37:31.731000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "hello", "author": "gg", "timestamp": "2024-07-17T03:37:35.114000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "posting new comment", "author": "sss", "timestamp": "2024-07-17T06:59:50.278000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "goodbye", "author": "sss", "timestamp": "2024-07-17T07:42:55.791000", "upvotes": 0, "children": [], "cluster_id": null}, {"text": "hello", "author": "sss", "timestamp": "2024-07-17T07:42:59.983000", "upvotes": 0, "children": [], "cluster_id": 20}]',22,20,1,'["rer"]','[]','sss','2024-07-17 07:43:03.702000',NULL);
CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    thread_id INT,
    text TEXT,
    author TEXT,
    timestamp TIMESTAMP,
    upvotes INT DEFAULT 0,
    children JSON DEFAULT '[]',
    cluster_id INT
);
INSERT INTO comments VALUES(1,1,'hello','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(3,1,'Test comment','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(4,1,'seems to be working','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(5,1,'fefe','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(6,3,'hello','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(7,1,'testing','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(8,1,'second second','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(9,1,'test','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(13,1,'My father is undergoing treatment for a chronic condition, and the absence of residents has made his care more fragmented. Theres less continuity, and weve seen different doctors at every visit. Its frustrating and worrisome, especially for those with serious health issues.','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(14,1,'tester is testing','admin','2024-07-14 20:22:23',0,'[]',NULL);
INSERT INTO comments VALUES(15,2,'this is first statement','TESTER3','2024-07-17 01:23:10.566000',0,'[]',NULL);
INSERT INTO comments VALUES(16,2,'this is second','TESTER3','2024-07-17 01:23:14.847000',0,'[]',NULL);
INSERT INTO comments VALUES(17,2,'third third ','TESTER3','2024-07-17 01:23:18.525000',0,'[]',NULL);
INSERT INTO comments VALUES(18,2,'hekki','gg','2024-07-17 03:37:31.731000',0,'[]',16);
INSERT INTO comments VALUES(19,2,'hello','gg','2024-07-17 03:37:35.114000',0,'[]',NULL);
INSERT INTO comments VALUES(20,2,'posting new comment','sss','2024-07-17 06:59:50.278000',0,'[]',NULL);
INSERT INTO comments VALUES(21,2,'goodbye','sss','2024-07-17 07:42:55.791000',0,'[]',NULL);
INSERT INTO comments VALUES(22,2,'hello','sss','2024-07-17 07:42:59.983000',0,'[]',NULL);
CREATE INDEX ix_logs_id ON logs (id);
CREATE INDEX ix_logs_user_id ON logs (user_id);
CREATE INDEX ix_logs_folder_name ON logs (folder_name);
CREATE INDEX ix_logs_action ON logs (action);
CREATE INDEX ix_threads_id ON threads (id);
CREATE INDEX ix_reviews_id ON reviews (id);

