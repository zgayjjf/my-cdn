create database if not exists `my_cdn`;
use `my_cdn`;

create table  if not exists `package` (
    `id` int(11) unsigned not null auto_increment,
    `name` varchar(100) not null,
    `version` varchar(50) not null,
    `downloaded` boolean not null default false,
    primary key (`id`)
) default charset=utf8;

create table if not exists `file` (
    `id` int(11) unsigned not null auto_increment,
    `path` varchar(100) not null,
    `package_id` int(11) unsigned not null,
    `published` boolean not null default false,
    primary key (`id`)
) default charset=utf8;

