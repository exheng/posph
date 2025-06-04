
CREATE TABLE role (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(120) NOT NULL,
    code varchar(120) NOT NULL
    );

INSERT INTO role (name,code) VALUES 
('Admin','Admin'),
('Manager','manager'),
('Account','Account'),
('Cashier','Cashier');

CREATE TABLE user (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    role_id int(11) DEFAULT NULL,
    name varchar(120) DEFAULT NULL,
    username varchar(255) NOT NULL UNIQUE,
    password varchar(255) DEFAULT NULL,
    is_active tinyint(1) DEFAULT NULL,
    create_by varchar(120) DEFAULT NULL,
    creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );


    ALTER TABLE user
    ADD FOREIGN KEY (role_id) REFERENCES role(id);


--talbe customer

    CREATE TABLE customer (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name varchar(120) NOT NULL,
        tel varchar(18) NOT NULL UNIQUE,
        email varchar(120) DEFAULT NULl,
        address text DEFAULT NULL,
        type varchar(120) DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );

--talbe supplier

    CREATE TABLE supplier (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name varchar(120) NOT NULL,
        code varchar(18) NOT NULL UNIQUE,
        tel varchar(18) NOT NULL UNIQUE,
        email varchar(120) DEFAULT NULL,
        address text DEFAULT NULL,
        website varchar(120) DEFAULT NULL,
        note text DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );



    CREATE TABLE product (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        category_id int(11) NOT NULL,
        barcode varchar(50) NOT NULL UNIQUE
        name varchar(120) NOT NULL,
        brand varchar(120) NOT NULL,
        description text DEFAULT NULL,
        qty int(6) DEFAULT 0 NOT NULL,
        price DECIMAL(6,2) DEFAULT 0 NOT NULL,
        discount DECIMAL(3,2) DEFAULT 0 NOT NULL,
        status tinyint(1) DEFAULT 0,
        image varchar(255) DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );


    CREATE TABLE product_image (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        product_id int(11),
        image varchar(255) NOT NULL,
    );


    CREATE TABLE `order` (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        order_no varchar(120) NOT NULL,
        customer_id int(11) DEFAULT NULl,
        user_id int(11) DEFAULT NULl,
        paid_amount DECIMAL(6,2) DEFAULT 0 NOT NULL,
        payment_method varchar(120) NOT NULl,
        remark text DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );


    CREATE TABLE order_detail (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        order_id int(11),
        product_id int(11) ,
        qty int(6) DEFAULT 0,
        price DECIMAL(6,2) DEFAULT 0,
        discount DECIMAL(6,2) DEFAULT 0,
        total DECIMAL(6,2) DEFAULT 0,
    );


    CREATE TABLE purchase (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        supplier_id int(11) ,
        ref varchar(255) NOT NULL,
        shipp_company varchar(255) DEFAULT NULL,
        shipp_cost DECIMAL(6,2) DEFAULT 0 ,
        paid_amount DECIMAL(6,2) DEFAULT 0 ,
        paid_date datetime,
        status varchar(120) DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );


    CREATE TABLE purchase_product (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        purchase_id int(11) ,
        product_id int(11) ,
        qty int(11) DEFAULT 0,
        cost DECIMAL(6,2) DEFAULT 0 ,
        discount DECIMAL(6,2) DEFAULT 0 ,
        amount DECIMAL(6,2) DEFAULT 0 ,
        retail_price DECIMAL(6,2) DEFAULT 0 ,
        remark text DEFAULT NULL,
        status varchar(120) DEFAULT NULL,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );


    CREATE TABLE expense_type (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name varchar(255) NOT NULL ,
        code varchar(255) NOT NULL
    );

    CREATE TABLE expense (
        id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
        expense_type_id int(11) ,
        ref_no varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        amount DECIMAL(6,2) DEFAULT 0 ,
        remark text DEFAULT NULL,
        expense_date datetime,
        create_by varchar(120) DEFAULT NULL,
        creat_at timestamp NOT NULL DEFAULT current_timestamp()
    );