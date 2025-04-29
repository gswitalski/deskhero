-- migration file: 20231026120000_create_deskhero_schema.sql
-- purpose: create deskhero schema tables, indexes and row level security policies
-- affected tables: users, desk, reservation, authorities
-- date: utc timestamp as indicated by filename
-- note: this migration creates the initial schema for the deskhero system

-- table: users
-- creates users table with columns id, username, name and password with unique constraint on username
create table users (
    id serial primary key,  -- primary key auto increment
    username varchar(50) not null unique,  -- unique username for each user
    name varchar(100) not null,  -- full name of the user
    password varchar(255) not null  -- hashed password stored
);

-- table: desk
-- creates desk table with columns id, room_name and desk_number
-- applies a unique constraint on (room_name, desk_number) to ensure no duplicate desk assignment in a room
create table desk (
    id serial primary key,
    room_name varchar(100) not null,
    desk_number varchar(100) not null,
    unique (room_name, desk_number)
);

-- table: reservation
-- creates reservation table for tracking desk reservations by users
-- enforces that a desk can only be reserved once per day using a unique constraint on (desk_id, reservation_date)
create table reservation (
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    desk_id integer not null references desk(id) on delete cascade,
    reservation_date date not null,
    status varchar(10) not null check (status in ('active','cancelled')),
    unique (desk_id, reservation_date)
);

-- table: authorities
-- creates authorities table to manage user roles for integration with spring security
create table authorities (
    username varchar(50) not null references users(username) on delete cascade,
    authority varchar(50) not null,
    primary key (username, authority)
);

-- add indexes to reservation table to optimize queries
create index idx_reservation_date on reservation (reservation_date);
create index idx_reservation_user_id on reservation (user_id);
create index idx_reservation_desk_id on reservation (desk_id);

-- enable row level security on reservation table to restrict data access at row level 
alter table reservation enable row level security;

-- create granular row level security policies for reservation table for authenticated users
-- policy for select operation for authenticated users
create policy reservation_select_authenticated on reservation
    for select
    to authenticated
    using (user_id = current_setting('app.current_user_id', true)::integer);

-- policy for insert operation for authenticated users; check ensures that user_id matches current session
create policy reservation_insert_authenticated on reservation
    for insert
    to authenticated
    with check (user_id = current_setting('app.current_user_id', true)::integer);

-- policy for update operation for authenticated users; using clause restricts which rows can be updated and with check ensures new values comply
create policy reservation_update_authenticated on reservation
    for update
    to authenticated
    using (user_id = current_setting('app.current_user_id', true)::integer)
    with check (user_id = current_setting('app.current_user_id', true)::integer);

-- policy for delete operation for authenticated users; ensures users can only delete their own reservations
create policy reservation_delete_authenticated on reservation
    for delete
    to authenticated
    using (user_id = current_setting('app.current_user_id', true)::integer);

-- create granular row level security policies for reservation table for admin users
-- policy for select operation for admin users; admin users have access to all reservations
create policy reservation_select_admin on reservation
    for select
    to admin_role
    using (true);

-- policy for insert operation for admin users; admin users can insert any reservation
create policy reservation_insert_admin on reservation
    for insert
    to admin_role
    with check (true);

-- policy for update operation for admin users; admin users can update any reservation
create policy reservation_update_admin on reservation
    for update
    to admin_role
    using (true)
    with check (true);

-- policy for delete operation for admin users; admin users can delete any reservation
create policy reservation_delete_admin on reservation
    for delete
    to admin_role
    using (true); 
