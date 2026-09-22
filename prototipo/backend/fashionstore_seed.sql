-- FashionStore SI2 - Dump Semilla Oficial (28 Tablas / 25 Casos de Uso)
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- Limpieza previa para idempotencia
DROP TABLE IF EXISTS "ciudades";
DROP TABLE IF EXISTS "proveedores";
DROP TABLE IF EXISTS "temporadas";
DROP TABLE IF EXISTS "categorias";
DROP TABLE IF EXISTS "marcas";
DROP TABLE IF EXISTS "sucursales";
DROP TABLE IF EXISTS "productos";
DROP TABLE IF EXISTS "usuarios";
DROP TABLE IF EXISTS "producto_colores";
DROP TABLE IF EXISTS "producto_tallas";
DROP TABLE IF EXISTS "inventario";
DROP TABLE IF EXISTS "tokens_recuperacion";
DROP TABLE IF EXISTS "bitacora_accesos";
DROP TABLE IF EXISTS "kardex_movimientos";
DROP TABLE IF EXISTS "reservas";
DROP TABLE IF EXISTS "carritos";
DROP TABLE IF EXISTS "ordenes_venta";
DROP TABLE IF EXISTS "metodos_pago";
DROP TABLE IF EXISTS "reserva_detalles";
DROP TABLE IF EXISTS "carrito_items";
DROP TABLE IF EXISTS "ordenes_detalle";
DROP TABLE IF EXISTS "transacciones_pago";
DROP TABLE IF EXISTS "gamificacion_perfiles";
DROP TABLE IF EXISTS "recompensas_catalogo";
DROP TABLE IF EXISTS "cupones_fidelizacion";
DROP TABLE IF EXISTS "bitacora_auditoria";
DROP TABLE IF EXISTS "devoluciones";
DROP TABLE IF EXISTS "devolucion_detalles";

CREATE TABLE bitacora_accesos (
	id_bitacora INTEGER NOT NULL, 
	id_usuario INTEGER, 
	ip_origen VARCHAR(45) NOT NULL, 
	user_agent VARCHAR(255), 
	exitoso BOOLEAN NOT NULL, 
	motivo VARCHAR(100), 
	fecha_hora DATETIME, 
	PRIMARY KEY (id_bitacora), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);
INSERT INTO "bitacora_accesos" VALUES(1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-18 18:43:50.054351');
INSERT INTO "bitacora_accesos" VALUES(2,1,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-18 19:04:44.329336');
INSERT INTO "bitacora_accesos" VALUES(3,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:26.088260');
INSERT INTO "bitacora_accesos" VALUES(4,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 15:04:26.955293');
INSERT INTO "bitacora_accesos" VALUES(5,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 15:04:27.397219');
INSERT INTO "bitacora_accesos" VALUES(6,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 15:04:27.885147');
INSERT INTO "bitacora_accesos" VALUES(7,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 15:04:28.324684');
INSERT INTO "bitacora_accesos" VALUES(8,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 15:04:28.764084');
INSERT INTO "bitacora_accesos" VALUES(9,6,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:31.613695');
INSERT INTO "bitacora_accesos" VALUES(10,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:32.098986');
INSERT INTO "bitacora_accesos" VALUES(11,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 15:04:32.157345');
INSERT INTO "bitacora_accesos" VALUES(12,4,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:32.582700');
INSERT INTO "bitacora_accesos" VALUES(13,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:33.033563');
INSERT INTO "bitacora_accesos" VALUES(14,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:33.501805');
INSERT INTO "bitacora_accesos" VALUES(15,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:34.017856');
INSERT INTO "bitacora_accesos" VALUES(16,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:34.482864');
INSERT INTO "bitacora_accesos" VALUES(17,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:04:34.939680');
INSERT INTO "bitacora_accesos" VALUES(18,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:05.196463');
INSERT INTO "bitacora_accesos" VALUES(19,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 15:09:05.659316');
INSERT INTO "bitacora_accesos" VALUES(20,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 15:09:06.186596');
INSERT INTO "bitacora_accesos" VALUES(21,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 15:09:06.641434');
INSERT INTO "bitacora_accesos" VALUES(22,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 15:09:07.074659');
INSERT INTO "bitacora_accesos" VALUES(23,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 15:09:07.507916');
INSERT INTO "bitacora_accesos" VALUES(24,6,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:10.321177');
INSERT INTO "bitacora_accesos" VALUES(25,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:10.762863');
INSERT INTO "bitacora_accesos" VALUES(26,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 15:09:10.872731');
INSERT INTO "bitacora_accesos" VALUES(27,4,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:11.387968');
INSERT INTO "bitacora_accesos" VALUES(28,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:11.859740');
INSERT INTO "bitacora_accesos" VALUES(29,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:12.352632');
INSERT INTO "bitacora_accesos" VALUES(30,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:12.872473');
INSERT INTO "bitacora_accesos" VALUES(31,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:13.377286');
INSERT INTO "bitacora_accesos" VALUES(32,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:09:13.927606');
INSERT INTO "bitacora_accesos" VALUES(33,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:18.647678');
INSERT INTO "bitacora_accesos" VALUES(34,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 15:17:19.316456');
INSERT INTO "bitacora_accesos" VALUES(35,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 15:17:19.931979');
INSERT INTO "bitacora_accesos" VALUES(36,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 15:17:20.512922');
INSERT INTO "bitacora_accesos" VALUES(37,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 15:17:20.995128');
INSERT INTO "bitacora_accesos" VALUES(38,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 15:17:21.517543');
INSERT INTO "bitacora_accesos" VALUES(39,6,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:24.502832');
INSERT INTO "bitacora_accesos" VALUES(40,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:24.982782');
INSERT INTO "bitacora_accesos" VALUES(41,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 15:17:25.049990');
INSERT INTO "bitacora_accesos" VALUES(42,4,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:25.518978');
INSERT INTO "bitacora_accesos" VALUES(43,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:26.047804');
INSERT INTO "bitacora_accesos" VALUES(44,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:26.555316');
INSERT INTO "bitacora_accesos" VALUES(45,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:27.214036');
INSERT INTO "bitacora_accesos" VALUES(46,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:27.721718');
INSERT INTO "bitacora_accesos" VALUES(47,1,'testclient','testclient',1,'Login exitoso','2026-09-19 15:17:28.241639');
INSERT INTO "bitacora_accesos" VALUES(48,6,'127.0.0.1','Dart/3.13 (dart:io)',0,'Contraseña errónea (Intento 1)','2026-09-19 15:33:30.565992');
INSERT INTO "bitacora_accesos" VALUES(49,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-19 15:39:50.247730');
INSERT INTO "bitacora_accesos" VALUES(50,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-19 15:39:51.639543');
INSERT INTO "bitacora_accesos" VALUES(51,6,'127.0.0.1','Dart/3.13 (dart:io)',0,'Contraseña errónea (Intento 2)','2026-09-19 15:40:42.089960');
INSERT INTO "bitacora_accesos" VALUES(52,6,'127.0.0.1','Python-urllib/3.14',0,'Contraseña errónea (Intento 1)','2026-09-19 15:55:21.648569');
INSERT INTO "bitacora_accesos" VALUES(53,6,'127.0.0.1','Python-urllib/3.14',1,'Login exitoso','2026-09-19 15:57:07.768133');
INSERT INTO "bitacora_accesos" VALUES(54,6,'127.0.0.1','Python-urllib/3.14',1,'Login exitoso','2026-09-19 15:57:32.317292');
INSERT INTO "bitacora_accesos" VALUES(55,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:28.239280');
INSERT INTO "bitacora_accesos" VALUES(56,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 16:05:28.726797');
INSERT INTO "bitacora_accesos" VALUES(57,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 16:05:29.186958');
INSERT INTO "bitacora_accesos" VALUES(58,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 16:05:29.654400');
INSERT INTO "bitacora_accesos" VALUES(59,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 16:05:30.115231');
INSERT INTO "bitacora_accesos" VALUES(60,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 16:05:30.618514');
INSERT INTO "bitacora_accesos" VALUES(61,6,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:34.434473');
INSERT INTO "bitacora_accesos" VALUES(62,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:34.970395');
INSERT INTO "bitacora_accesos" VALUES(63,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 16:05:35.036092');
INSERT INTO "bitacora_accesos" VALUES(64,4,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:35.540284');
INSERT INTO "bitacora_accesos" VALUES(65,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:36.093088');
INSERT INTO "bitacora_accesos" VALUES(66,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:36.675508');
INSERT INTO "bitacora_accesos" VALUES(67,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:37.322023');
INSERT INTO "bitacora_accesos" VALUES(68,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:37.906097');
INSERT INTO "bitacora_accesos" VALUES(69,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:05:38.577728');
INSERT INTO "bitacora_accesos" VALUES(70,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-19 16:12:20.790382');
INSERT INTO "bitacora_accesos" VALUES(71,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-19 16:41:48.942447');
INSERT INTO "bitacora_accesos" VALUES(72,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:56:51.860591');
INSERT INTO "bitacora_accesos" VALUES(73,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 16:56:52.425218');
INSERT INTO "bitacora_accesos" VALUES(74,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 16:56:53.042955');
INSERT INTO "bitacora_accesos" VALUES(75,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 16:56:53.564773');
INSERT INTO "bitacora_accesos" VALUES(76,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 16:56:54.075629');
INSERT INTO "bitacora_accesos" VALUES(77,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 16:56:54.605063');
INSERT INTO "bitacora_accesos" VALUES(78,6,'testclient','testclient',1,'Login exitoso','2026-09-19 16:56:58.461487');
INSERT INTO "bitacora_accesos" VALUES(79,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:56:59.066409');
INSERT INTO "bitacora_accesos" VALUES(80,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 16:56:59.154734');
INSERT INTO "bitacora_accesos" VALUES(81,4,'testclient','testclient',1,'Login exitoso','2026-09-19 16:56:59.874186');
INSERT INTO "bitacora_accesos" VALUES(82,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:57:00.602220');
INSERT INTO "bitacora_accesos" VALUES(83,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:57:01.246416');
INSERT INTO "bitacora_accesos" VALUES(84,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:57:01.959240');
INSERT INTO "bitacora_accesos" VALUES(85,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:57:02.622778');
INSERT INTO "bitacora_accesos" VALUES(86,1,'testclient','testclient',1,'Login exitoso','2026-09-19 16:57:03.240727');
INSERT INTO "bitacora_accesos" VALUES(87,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:51.195850');
INSERT INTO "bitacora_accesos" VALUES(88,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 17:44:51.651533');
INSERT INTO "bitacora_accesos" VALUES(89,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 17:44:52.111779');
INSERT INTO "bitacora_accesos" VALUES(90,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 17:44:52.600134');
INSERT INTO "bitacora_accesos" VALUES(91,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 17:44:53.116255');
INSERT INTO "bitacora_accesos" VALUES(92,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 17:44:53.568212');
INSERT INTO "bitacora_accesos" VALUES(93,6,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:56.292063');
INSERT INTO "bitacora_accesos" VALUES(94,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:56.773275');
INSERT INTO "bitacora_accesos" VALUES(95,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 17:44:56.846362');
INSERT INTO "bitacora_accesos" VALUES(96,4,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:57.319102');
INSERT INTO "bitacora_accesos" VALUES(97,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:57.828280');
INSERT INTO "bitacora_accesos" VALUES(98,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:58.356815');
INSERT INTO "bitacora_accesos" VALUES(99,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:59.086342');
INSERT INTO "bitacora_accesos" VALUES(100,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:44:59.622991');
INSERT INTO "bitacora_accesos" VALUES(101,1,'testclient','testclient',1,'Login exitoso','2026-09-19 17:45:00.117428');
INSERT INTO "bitacora_accesos" VALUES(102,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:01.331382');
INSERT INTO "bitacora_accesos" VALUES(103,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 18:57:01.840406');
INSERT INTO "bitacora_accesos" VALUES(104,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 18:57:02.333495');
INSERT INTO "bitacora_accesos" VALUES(105,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 18:57:02.847459');
INSERT INTO "bitacora_accesos" VALUES(106,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 18:57:03.367334');
INSERT INTO "bitacora_accesos" VALUES(107,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 18:57:03.838271');
INSERT INTO "bitacora_accesos" VALUES(108,6,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:06.509947');
INSERT INTO "bitacora_accesos" VALUES(109,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:06.957552');
INSERT INTO "bitacora_accesos" VALUES(110,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 18:57:07.038952');
INSERT INTO "bitacora_accesos" VALUES(111,4,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:07.608130');
INSERT INTO "bitacora_accesos" VALUES(112,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:08.089625');
INSERT INTO "bitacora_accesos" VALUES(113,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:08.584290');
INSERT INTO "bitacora_accesos" VALUES(114,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:09.126944');
INSERT INTO "bitacora_accesos" VALUES(115,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:09.623377');
INSERT INTO "bitacora_accesos" VALUES(116,1,'testclient','testclient',1,'Login exitoso','2026-09-19 18:57:10.082339');
INSERT INTO "bitacora_accesos" VALUES(117,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:45.502091');
INSERT INTO "bitacora_accesos" VALUES(118,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 19:26:45.962206');
INSERT INTO "bitacora_accesos" VALUES(119,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 19:26:46.423949');
INSERT INTO "bitacora_accesos" VALUES(120,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 19:26:46.864460');
INSERT INTO "bitacora_accesos" VALUES(121,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 19:26:47.306418');
INSERT INTO "bitacora_accesos" VALUES(122,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 19:26:47.823730');
INSERT INTO "bitacora_accesos" VALUES(123,6,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:50.536125');
INSERT INTO "bitacora_accesos" VALUES(124,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:50.982938');
INSERT INTO "bitacora_accesos" VALUES(125,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 19:26:51.060030');
INSERT INTO "bitacora_accesos" VALUES(126,4,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:51.506191');
INSERT INTO "bitacora_accesos" VALUES(127,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:51.991098');
INSERT INTO "bitacora_accesos" VALUES(128,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:52.507584');
INSERT INTO "bitacora_accesos" VALUES(129,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:53.073488');
INSERT INTO "bitacora_accesos" VALUES(130,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:53.717612');
INSERT INTO "bitacora_accesos" VALUES(131,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:26:54.236562');
INSERT INTO "bitacora_accesos" VALUES(132,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:11.026959');
INSERT INTO "bitacora_accesos" VALUES(133,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 19:51:11.544868');
INSERT INTO "bitacora_accesos" VALUES(134,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 19:51:12.196562');
INSERT INTO "bitacora_accesos" VALUES(135,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 19:51:12.761069');
INSERT INTO "bitacora_accesos" VALUES(136,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 19:51:13.343272');
INSERT INTO "bitacora_accesos" VALUES(137,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 19:51:13.948532');
INSERT INTO "bitacora_accesos" VALUES(138,6,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:18.233965');
INSERT INTO "bitacora_accesos" VALUES(139,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:19.250958');
INSERT INTO "bitacora_accesos" VALUES(140,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 19:51:19.363459');
INSERT INTO "bitacora_accesos" VALUES(141,4,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:20.334053');
INSERT INTO "bitacora_accesos" VALUES(142,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:21.094808');
INSERT INTO "bitacora_accesos" VALUES(143,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:22.454761');
INSERT INTO "bitacora_accesos" VALUES(144,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:23.228209');
INSERT INTO "bitacora_accesos" VALUES(145,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:24.194752');
INSERT INTO "bitacora_accesos" VALUES(146,1,'testclient','testclient',1,'Login exitoso','2026-09-19 19:51:25.091786');
INSERT INTO "bitacora_accesos" VALUES(147,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:03.163467');
INSERT INTO "bitacora_accesos" VALUES(148,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 20:01:03.687931');
INSERT INTO "bitacora_accesos" VALUES(149,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 20:01:04.294044');
INSERT INTO "bitacora_accesos" VALUES(150,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 20:01:04.760495');
INSERT INTO "bitacora_accesos" VALUES(151,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 20:01:05.378231');
INSERT INTO "bitacora_accesos" VALUES(152,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 20:01:06.628438');
INSERT INTO "bitacora_accesos" VALUES(153,6,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:09.911443');
INSERT INTO "bitacora_accesos" VALUES(154,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:10.363204');
INSERT INTO "bitacora_accesos" VALUES(155,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 20:01:10.430114');
INSERT INTO "bitacora_accesos" VALUES(156,4,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:11.001856');
INSERT INTO "bitacora_accesos" VALUES(157,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:11.514258');
INSERT INTO "bitacora_accesos" VALUES(158,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:12.097061');
INSERT INTO "bitacora_accesos" VALUES(159,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:12.685325');
INSERT INTO "bitacora_accesos" VALUES(160,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:13.281831');
INSERT INTO "bitacora_accesos" VALUES(161,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:01:13.871774');
INSERT INTO "bitacora_accesos" VALUES(162,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:29.933106');
INSERT INTO "bitacora_accesos" VALUES(163,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-19 20:27:30.395220');
INSERT INTO "bitacora_accesos" VALUES(164,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-19 20:27:30.863427');
INSERT INTO "bitacora_accesos" VALUES(165,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-19 20:27:31.320970');
INSERT INTO "bitacora_accesos" VALUES(166,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-19 20:27:31.757776');
INSERT INTO "bitacora_accesos" VALUES(167,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-19 20:27:32.237349');
INSERT INTO "bitacora_accesos" VALUES(168,6,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:34.962075');
INSERT INTO "bitacora_accesos" VALUES(169,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:35.426611');
INSERT INTO "bitacora_accesos" VALUES(170,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-19 20:27:35.496814');
INSERT INTO "bitacora_accesos" VALUES(171,4,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:35.940384');
INSERT INTO "bitacora_accesos" VALUES(172,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:36.445105');
INSERT INTO "bitacora_accesos" VALUES(173,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:36.973446');
INSERT INTO "bitacora_accesos" VALUES(174,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:37.538570');
INSERT INTO "bitacora_accesos" VALUES(175,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:38.047297');
INSERT INTO "bitacora_accesos" VALUES(176,1,'testclient','testclient',1,'Login exitoso','2026-09-19 20:27:38.542031');
INSERT INTO "bitacora_accesos" VALUES(177,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 15:33:57.413295');
INSERT INTO "bitacora_accesos" VALUES(178,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 16:17:27.696420');
INSERT INTO "bitacora_accesos" VALUES(179,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:02.292726');
INSERT INTO "bitacora_accesos" VALUES(180,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-20 17:01:02.786051');
INSERT INTO "bitacora_accesos" VALUES(181,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-20 17:01:03.276913');
INSERT INTO "bitacora_accesos" VALUES(182,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-20 17:01:03.765140');
INSERT INTO "bitacora_accesos" VALUES(183,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-20 17:01:04.248204');
INSERT INTO "bitacora_accesos" VALUES(184,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 17:01:04.727953');
INSERT INTO "bitacora_accesos" VALUES(185,6,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:07.820946');
INSERT INTO "bitacora_accesos" VALUES(186,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:08.417297');
INSERT INTO "bitacora_accesos" VALUES(187,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 17:01:08.491308');
INSERT INTO "bitacora_accesos" VALUES(188,4,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:08.966174');
INSERT INTO "bitacora_accesos" VALUES(189,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:09.535504');
INSERT INTO "bitacora_accesos" VALUES(190,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:10.099596');
INSERT INTO "bitacora_accesos" VALUES(191,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:10.749409');
INSERT INTO "bitacora_accesos" VALUES(192,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:11.286024');
INSERT INTO "bitacora_accesos" VALUES(193,1,'testclient','testclient',1,'Login exitoso','2026-09-20 17:01:11.832198');
INSERT INTO "bitacora_accesos" VALUES(194,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:48.713219');
INSERT INTO "bitacora_accesos" VALUES(195,7,'testclient','testclient',0,'Contraseña errónea (Intento 1)','2026-09-20 19:04:49.226648');
INSERT INTO "bitacora_accesos" VALUES(196,7,'testclient','testclient',0,'Contraseña errónea (Intento 2)','2026-09-20 19:04:49.704121');
INSERT INTO "bitacora_accesos" VALUES(197,7,'testclient','testclient',0,'Contraseña errónea (Intento 3)','2026-09-20 19:04:50.183764');
INSERT INTO "bitacora_accesos" VALUES(198,7,'testclient','testclient',0,'Contraseña errónea (Intento 4)','2026-09-20 19:04:50.671553');
INSERT INTO "bitacora_accesos" VALUES(199,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 19:04:51.151276');
INSERT INTO "bitacora_accesos" VALUES(200,6,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:54.595215');
INSERT INTO "bitacora_accesos" VALUES(201,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:55.053976');
INSERT INTO "bitacora_accesos" VALUES(202,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 19:04:55.127586');
INSERT INTO "bitacora_accesos" VALUES(203,4,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:55.596515');
INSERT INTO "bitacora_accesos" VALUES(204,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:56.284792');
INSERT INTO "bitacora_accesos" VALUES(205,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:56.814948');
INSERT INTO "bitacora_accesos" VALUES(206,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:57.423186');
INSERT INTO "bitacora_accesos" VALUES(207,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:57.969302');
INSERT INTO "bitacora_accesos" VALUES(208,1,'testclient','testclient',1,'Login exitoso','2026-09-20 19:04:58.470846');
INSERT INTO "bitacora_accesos" VALUES(209,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:04:17.643474');
INSERT INTO "bitacora_accesos" VALUES(210,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:25:27.102845');
INSERT INTO "bitacora_accesos" VALUES(211,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:26:32.428540');
INSERT INTO "bitacora_accesos" VALUES(212,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:27:00.651001');
INSERT INTO "bitacora_accesos" VALUES(213,4,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:34:54.673034');
INSERT INTO "bitacora_accesos" VALUES(214,5,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:36:41.882711');
INSERT INTO "bitacora_accesos" VALUES(215,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:36:59.491132');
INSERT INTO "bitacora_accesos" VALUES(216,4,'127.0.0.1','python-requests/2.31.0',1,'Login exitoso','2026-09-20 21:37:10.689217');
INSERT INTO "bitacora_accesos" VALUES(217,4,'127.0.0.1','python-requests/2.31.0',0,'Contraseña errónea (Intento 1)','2026-09-20 21:37:25.741762');
INSERT INTO "bitacora_accesos" VALUES(218,10,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 21:45:47.700630');
INSERT INTO "bitacora_accesos" VALUES(219,12,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:09:41.921603');
INSERT INTO "bitacora_accesos" VALUES(220,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:10:55.629408');
INSERT INTO "bitacora_accesos" VALUES(221,1,'127.0.0.1',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de test.bloqueo@store.bo','2026-09-20 22:11:51.612420');
INSERT INTO "bitacora_accesos" VALUES(222,1,'127.0.0.1',NULL,1,'MODIF_USUARIO: Se modificó información de usuario ID 6','2026-09-20 22:13:35.829874');
INSERT INTO "bitacora_accesos" VALUES(223,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:25:46.629320');
INSERT INTO "bitacora_accesos" VALUES(224,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:25:53.644888');
INSERT INTO "bitacora_accesos" VALUES(225,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'Contraseña errónea (Intento 1)','2026-09-20 22:26:24.333558');
INSERT INTO "bitacora_accesos" VALUES(226,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'Contraseña errónea (Intento 2)','2026-09-20 22:26:28.386291');
INSERT INTO "bitacora_accesos" VALUES(227,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',0,'Contraseña errónea (Intento 3)','2026-09-20 22:26:30.621361');
INSERT INTO "bitacora_accesos" VALUES(228,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:26:56.952410');
INSERT INTO "bitacora_accesos" VALUES(229,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:27:45.164100');
INSERT INTO "bitacora_accesos" VALUES(230,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:33:34.666461');
INSERT INTO "bitacora_accesos" VALUES(231,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:41.979491');
INSERT INTO "bitacora_accesos" VALUES(232,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-20 22:37:42.524353');
INSERT INTO "bitacora_accesos" VALUES(233,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-20 22:37:43.014041');
INSERT INTO "bitacora_accesos" VALUES(234,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-20 22:37:43.519746');
INSERT INTO "bitacora_accesos" VALUES(235,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-20 22:37:44.114194');
INSERT INTO "bitacora_accesos" VALUES(236,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 22:37:44.613700');
INSERT INTO "bitacora_accesos" VALUES(237,6,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:47.611927');
INSERT INTO "bitacora_accesos" VALUES(238,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:48.106045');
INSERT INTO "bitacora_accesos" VALUES(239,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 22:37:48.175209');
INSERT INTO "bitacora_accesos" VALUES(240,4,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:48.668353');
INSERT INTO "bitacora_accesos" VALUES(241,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:49.226247');
INSERT INTO "bitacora_accesos" VALUES(242,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:49.804170');
INSERT INTO "bitacora_accesos" VALUES(243,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:50.422043');
INSERT INTO "bitacora_accesos" VALUES(244,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:50.967217');
INSERT INTO "bitacora_accesos" VALUES(245,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:37:51.590044');
INSERT INTO "bitacora_accesos" VALUES(246,1,'127.0.0.1',NULL,1,'MODIF_USUARIO: Se modificó información de usuario ID 8','2026-09-20 22:39:43.277447');
INSERT INTO "bitacora_accesos" VALUES(247,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:40:27.398913');
INSERT INTO "bitacora_accesos" VALUES(248,1,'127.0.0.1',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de mujicamauricio412@gmail.com','2026-09-20 22:40:33.765335');
INSERT INTO "bitacora_accesos" VALUES(249,8,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:40:49.820182');
INSERT INTO "bitacora_accesos" VALUES(250,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 22:41:14.249280');
INSERT INTO "bitacora_accesos" VALUES(251,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:56:55.838206');
INSERT INTO "bitacora_accesos" VALUES(252,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-20 22:56:56.348368');
INSERT INTO "bitacora_accesos" VALUES(253,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-20 22:56:56.877282');
INSERT INTO "bitacora_accesos" VALUES(254,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-20 22:56:57.351159');
INSERT INTO "bitacora_accesos" VALUES(255,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-20 22:56:57.836897');
INSERT INTO "bitacora_accesos" VALUES(256,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 22:56:58.315963');
INSERT INTO "bitacora_accesos" VALUES(257,6,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:01.454643');
INSERT INTO "bitacora_accesos" VALUES(258,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:01.950701');
INSERT INTO "bitacora_accesos" VALUES(259,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 22:57:02.020034');
INSERT INTO "bitacora_accesos" VALUES(260,4,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:02.488075');
INSERT INTO "bitacora_accesos" VALUES(261,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:03.024906');
INSERT INTO "bitacora_accesos" VALUES(262,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:03.586831');
INSERT INTO "bitacora_accesos" VALUES(263,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:04.245519');
INSERT INTO "bitacora_accesos" VALUES(264,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:04.803709');
INSERT INTO "bitacora_accesos" VALUES(265,1,'testclient','testclient',1,'Login exitoso','2026-09-20 22:57:05.349033');
INSERT INTO "bitacora_accesos" VALUES(266,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:26.168403');
INSERT INTO "bitacora_accesos" VALUES(267,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-20 23:08:26.786621');
INSERT INTO "bitacora_accesos" VALUES(268,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-20 23:08:27.551376');
INSERT INTO "bitacora_accesos" VALUES(269,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-20 23:08:28.244943');
INSERT INTO "bitacora_accesos" VALUES(270,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-20 23:08:29.058057');
INSERT INTO "bitacora_accesos" VALUES(271,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 23:08:29.615298');
INSERT INTO "bitacora_accesos" VALUES(272,6,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:33.009041');
INSERT INTO "bitacora_accesos" VALUES(273,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:33.589574');
INSERT INTO "bitacora_accesos" VALUES(274,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 23:08:33.651697');
INSERT INTO "bitacora_accesos" VALUES(275,4,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:34.211915');
INSERT INTO "bitacora_accesos" VALUES(276,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:34.849244');
INSERT INTO "bitacora_accesos" VALUES(277,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:35.610295');
INSERT INTO "bitacora_accesos" VALUES(278,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:36.475003');
INSERT INTO "bitacora_accesos" VALUES(279,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:37.039080');
INSERT INTO "bitacora_accesos" VALUES(280,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:08:37.788506');
INSERT INTO "bitacora_accesos" VALUES(281,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:13.501624');
INSERT INTO "bitacora_accesos" VALUES(282,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-20 23:30:14.103203');
INSERT INTO "bitacora_accesos" VALUES(283,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-20 23:30:14.819380');
INSERT INTO "bitacora_accesos" VALUES(284,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-20 23:30:15.603651');
INSERT INTO "bitacora_accesos" VALUES(285,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-20 23:30:16.134432');
INSERT INTO "bitacora_accesos" VALUES(286,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-20 23:30:16.714863');
INSERT INTO "bitacora_accesos" VALUES(287,6,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:19.869420');
INSERT INTO "bitacora_accesos" VALUES(288,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:20.438684');
INSERT INTO "bitacora_accesos" VALUES(289,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-20 23:30:20.523031');
INSERT INTO "bitacora_accesos" VALUES(290,4,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:21.053892');
INSERT INTO "bitacora_accesos" VALUES(291,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:21.631633');
INSERT INTO "bitacora_accesos" VALUES(292,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:22.174167');
INSERT INTO "bitacora_accesos" VALUES(293,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:22.775162');
INSERT INTO "bitacora_accesos" VALUES(294,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:23.408657');
INSERT INTO "bitacora_accesos" VALUES(295,1,'testclient','testclient',1,'Login exitoso','2026-09-20 23:30:23.971035');
INSERT INTO "bitacora_accesos" VALUES(296,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 23:48:07.686679');
INSERT INTO "bitacora_accesos" VALUES(297,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-20 23:48:26.120337');
INSERT INTO "bitacora_accesos" VALUES(298,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:09:07.885273');
INSERT INTO "bitacora_accesos" VALUES(299,1,'127.0.0.1',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 14:09:12.908572');
INSERT INTO "bitacora_accesos" VALUES(300,4,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:09:24.461404');
INSERT INTO "bitacora_accesos" VALUES(301,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:10:16.611871');
INSERT INTO "bitacora_accesos" VALUES(302,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:14:46.927260');
INSERT INTO "bitacora_accesos" VALUES(303,1,'127.0.0.1','python-requests/2.31.0',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 14:18:57.786903');
INSERT INTO "bitacora_accesos" VALUES(304,6,'127.0.0.1','python-requests/2.31.0',1,'Login exitoso','2026-09-21 14:19:54.297224');
INSERT INTO "bitacora_accesos" VALUES(305,6,'127.0.0.1','python-requests/2.31.0',1,'Login exitoso','2026-09-21 14:20:48.478102');
INSERT INTO "bitacora_accesos" VALUES(306,1,'127.0.0.1','python-requests/2.31.0',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 14:36:01.854870');
INSERT INTO "bitacora_accesos" VALUES(307,1,'127.0.0.1','python-requests/2.31.0',1,'Login exitoso','2026-09-21 14:36:58.459918');
INSERT INTO "bitacora_accesos" VALUES(308,6,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:38:41.399347');
INSERT INTO "bitacora_accesos" VALUES(309,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:39:21.718973');
INSERT INTO "bitacora_accesos" VALUES(310,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',1,'Login exitoso','2026-09-21 14:39:47.992468');
INSERT INTO "bitacora_accesos" VALUES(311,1,'testclient','testclient',1,'Login exitoso','2026-09-21 14:51:01.037529');
INSERT INTO "bitacora_accesos" VALUES(312,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:46.846039');
INSERT INTO "bitacora_accesos" VALUES(313,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 16:13:47.491470');
INSERT INTO "bitacora_accesos" VALUES(314,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 16:13:48.022780');
INSERT INTO "bitacora_accesos" VALUES(315,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 16:13:48.520365');
INSERT INTO "bitacora_accesos" VALUES(316,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 16:13:49.021320');
INSERT INTO "bitacora_accesos" VALUES(317,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 16:13:49.644036');
INSERT INTO "bitacora_accesos" VALUES(318,6,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:52.894585');
INSERT INTO "bitacora_accesos" VALUES(319,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:53.426439');
INSERT INTO "bitacora_accesos" VALUES(320,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 16:13:53.499608');
INSERT INTO "bitacora_accesos" VALUES(321,4,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:53.957554');
INSERT INTO "bitacora_accesos" VALUES(322,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:54.488690');
INSERT INTO "bitacora_accesos" VALUES(323,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:55.069338');
INSERT INTO "bitacora_accesos" VALUES(324,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:55.827637');
INSERT INTO "bitacora_accesos" VALUES(325,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:56.419322');
INSERT INTO "bitacora_accesos" VALUES(326,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:13:56.950238');
INSERT INTO "bitacora_accesos" VALUES(327,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:42.929741');
INSERT INTO "bitacora_accesos" VALUES(328,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 16:42:43.426973');
INSERT INTO "bitacora_accesos" VALUES(329,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 16:42:43.897994');
INSERT INTO "bitacora_accesos" VALUES(330,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 16:42:44.370939');
INSERT INTO "bitacora_accesos" VALUES(331,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 16:42:44.858712');
INSERT INTO "bitacora_accesos" VALUES(332,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 16:42:45.309088');
INSERT INTO "bitacora_accesos" VALUES(333,6,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:48.178356');
INSERT INTO "bitacora_accesos" VALUES(334,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:48.670856');
INSERT INTO "bitacora_accesos" VALUES(335,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 16:42:48.744922');
INSERT INTO "bitacora_accesos" VALUES(336,4,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:49.223637');
INSERT INTO "bitacora_accesos" VALUES(337,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:49.834821');
INSERT INTO "bitacora_accesos" VALUES(338,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:50.504812');
INSERT INTO "bitacora_accesos" VALUES(339,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:51.153822');
INSERT INTO "bitacora_accesos" VALUES(340,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:51.710285');
INSERT INTO "bitacora_accesos" VALUES(341,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:42:52.224206');
INSERT INTO "bitacora_accesos" VALUES(342,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:29.906712');
INSERT INTO "bitacora_accesos" VALUES(343,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 16:52:31.225025');
INSERT INTO "bitacora_accesos" VALUES(344,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 16:52:31.850015');
INSERT INTO "bitacora_accesos" VALUES(345,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 16:52:32.487213');
INSERT INTO "bitacora_accesos" VALUES(346,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 16:52:33.406581');
INSERT INTO "bitacora_accesos" VALUES(347,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 16:52:34.090197');
INSERT INTO "bitacora_accesos" VALUES(348,6,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:37.251386');
INSERT INTO "bitacora_accesos" VALUES(349,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:37.895883');
INSERT INTO "bitacora_accesos" VALUES(350,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 16:52:37.969234');
INSERT INTO "bitacora_accesos" VALUES(351,4,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:38.463491');
INSERT INTO "bitacora_accesos" VALUES(352,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:39.005365');
INSERT INTO "bitacora_accesos" VALUES(353,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:39.564744');
INSERT INTO "bitacora_accesos" VALUES(354,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:40.176444');
INSERT INTO "bitacora_accesos" VALUES(355,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:40.715998');
INSERT INTO "bitacora_accesos" VALUES(356,1,'testclient','testclient',1,'Login exitoso','2026-09-21 16:52:41.230248');
INSERT INTO "bitacora_accesos" VALUES(357,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:29.006561');
INSERT INTO "bitacora_accesos" VALUES(358,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 17:08:29.604961');
INSERT INTO "bitacora_accesos" VALUES(359,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 17:08:30.142173');
INSERT INTO "bitacora_accesos" VALUES(360,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 17:08:30.677605');
INSERT INTO "bitacora_accesos" VALUES(361,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 17:08:31.199442');
INSERT INTO "bitacora_accesos" VALUES(362,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 17:08:31.717615');
INSERT INTO "bitacora_accesos" VALUES(363,6,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:34.981504');
INSERT INTO "bitacora_accesos" VALUES(364,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:35.505052');
INSERT INTO "bitacora_accesos" VALUES(365,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 17:08:35.597553');
INSERT INTO "bitacora_accesos" VALUES(366,4,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:36.277018');
INSERT INTO "bitacora_accesos" VALUES(367,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:36.912105');
INSERT INTO "bitacora_accesos" VALUES(368,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:37.528355');
INSERT INTO "bitacora_accesos" VALUES(369,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:38.228175');
INSERT INTO "bitacora_accesos" VALUES(370,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:38.872643');
INSERT INTO "bitacora_accesos" VALUES(371,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:08:39.469112');
INSERT INTO "bitacora_accesos" VALUES(372,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:47.950518');
INSERT INTO "bitacora_accesos" VALUES(373,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 17:09:48.447561');
INSERT INTO "bitacora_accesos" VALUES(374,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 17:09:48.898744');
INSERT INTO "bitacora_accesos" VALUES(375,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 17:09:49.352941');
INSERT INTO "bitacora_accesos" VALUES(376,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 17:09:49.821307');
INSERT INTO "bitacora_accesos" VALUES(377,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 17:09:50.277901');
INSERT INTO "bitacora_accesos" VALUES(378,6,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:53.193949');
INSERT INTO "bitacora_accesos" VALUES(379,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:53.664670');
INSERT INTO "bitacora_accesos" VALUES(380,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 17:09:53.727447');
INSERT INTO "bitacora_accesos" VALUES(381,4,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:54.194087');
INSERT INTO "bitacora_accesos" VALUES(382,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:54.709471');
INSERT INTO "bitacora_accesos" VALUES(383,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:55.237168');
INSERT INTO "bitacora_accesos" VALUES(384,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:55.802144');
INSERT INTO "bitacora_accesos" VALUES(385,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:56.381513');
INSERT INTO "bitacora_accesos" VALUES(386,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:09:56.909487');
INSERT INTO "bitacora_accesos" VALUES(387,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:17:49.761193');
INSERT INTO "bitacora_accesos" VALUES(388,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:17:49.793097');
INSERT INTO "bitacora_accesos" VALUES(389,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:17:56.255806');
INSERT INTO "bitacora_accesos" VALUES(390,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:17:57.623342');
INSERT INTO "bitacora_accesos" VALUES(391,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:17:58.540675');
INSERT INTO "bitacora_accesos" VALUES(392,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=BOTTOM10','2026-09-21 17:17:59.278589');
INSERT INTO "bitacora_accesos" VALUES(393,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:18:00.220026');
INSERT INTO "bitacora_accesos" VALUES(394,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:18:01.293972');
INSERT INTO "bitacora_accesos" VALUES(395,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:18:01.989089');
INSERT INTO "bitacora_accesos" VALUES(396,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:18:06.137717');
INSERT INTO "bitacora_accesos" VALUES(397,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:18:07.429822');
INSERT INTO "bitacora_accesos" VALUES(398,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=BOTTOM10','2026-09-21 17:18:08.370757');
INSERT INTO "bitacora_accesos" VALUES(399,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:18:14.632023');
INSERT INTO "bitacora_accesos" VALUES(400,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:18:15.130221');
INSERT INTO "bitacora_accesos" VALUES(401,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=HOY, Ranking=TODOS','2026-09-21 17:19:16.540239');
INSERT INTO "bitacora_accesos" VALUES(402,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=7_DIAS, Ranking=TODOS','2026-09-21 17:19:16.959885');
INSERT INTO "bitacora_accesos" VALUES(403,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=HOY, Ranking=TODOS','2026-09-21 17:19:18.841435');
INSERT INTO "bitacora_accesos" VALUES(404,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:19.902819');
INSERT INTO "bitacora_accesos" VALUES(405,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=7_DIAS, Ranking=TODOS','2026-09-21 17:19:21.165116');
INSERT INTO "bitacora_accesos" VALUES(406,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=MES, Ranking=TODOS','2026-09-21 17:19:21.721087');
INSERT INTO "bitacora_accesos" VALUES(407,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:22.878900');
INSERT INTO "bitacora_accesos" VALUES(408,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Equipetrol, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:26.589877');
INSERT INTO "bitacora_accesos" VALUES(409,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Centro, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:28.378140');
INSERT INTO "bitacora_accesos" VALUES(410,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Calacoto, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:31.119421');
INSERT INTO "bitacora_accesos" VALUES(411,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal El Prado, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:32.240732');
INSERT INTO "bitacora_accesos" VALUES(412,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Equipetrol, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:34.359890');
INSERT INTO "bitacora_accesos" VALUES(413,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:19:36.284699');
INSERT INTO "bitacora_accesos" VALUES(414,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:21:06.624855');
INSERT INTO "bitacora_accesos" VALUES(415,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:21:22.170653');
INSERT INTO "bitacora_accesos" VALUES(416,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Equipetrol, Rango=TODO, Ranking=TODOS','2026-09-21 17:21:45.158043');
INSERT INTO "bitacora_accesos" VALUES(417,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=7_DIAS, Ranking=TODOS','2026-09-21 17:21:45.240489');
INSERT INTO "bitacora_accesos" VALUES(418,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TOP10','2026-09-21 17:21:45.329294');
INSERT INTO "bitacora_accesos" VALUES(419,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=BOTTOM10','2026-09-21 17:21:45.408684');
INSERT INTO "bitacora_accesos" VALUES(420,3,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Equipetrol, Rango=TODO, Ranking=TODOS','2026-09-21 17:22:30.155907');
INSERT INTO "bitacora_accesos" VALUES(421,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:35.275687');
INSERT INTO "bitacora_accesos" VALUES(422,7,'testclient','testclient',0,'Contraseña errónea (Intento 1 de 5)','2026-09-21 17:24:35.753173');
INSERT INTO "bitacora_accesos" VALUES(423,7,'testclient','testclient',0,'Contraseña errónea (Intento 2 de 5)','2026-09-21 17:24:36.200734');
INSERT INTO "bitacora_accesos" VALUES(424,7,'testclient','testclient',0,'Contraseña errónea (Intento 3 de 5)','2026-09-21 17:24:36.668687');
INSERT INTO "bitacora_accesos" VALUES(425,7,'testclient','testclient',0,'Contraseña errónea (Intento 4 de 5)','2026-09-21 17:24:37.126640');
INSERT INTO "bitacora_accesos" VALUES(426,7,'testclient','testclient',0,'Bloqueo automático por 5to intento fallido','2026-09-21 17:24:37.587049');
INSERT INTO "bitacora_accesos" VALUES(427,6,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:40.653759');
INSERT INTO "bitacora_accesos" VALUES(428,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:41.122426');
INSERT INTO "bitacora_accesos" VALUES(429,1,'testclient',NULL,1,'DESBLOQUEO_ADMIN: Administrador ID 1 desbloqueó cuenta de javier.roca@store.bo','2026-09-21 17:24:41.185932');
INSERT INTO "bitacora_accesos" VALUES(430,4,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:41.658098');
INSERT INTO "bitacora_accesos" VALUES(431,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:42.180573');
INSERT INTO "bitacora_accesos" VALUES(432,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:42.698357');
INSERT INTO "bitacora_accesos" VALUES(433,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:43.305895');
INSERT INTO "bitacora_accesos" VALUES(434,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:43.829641');
INSERT INTO "bitacora_accesos" VALUES(435,1,'testclient','testclient',1,'Login exitoso','2026-09-21 17:24:44.338518');
INSERT INTO "bitacora_accesos" VALUES(436,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:25:18.485445');
INSERT INTO "bitacora_accesos" VALUES(437,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=HOY, Ranking=TODOS','2026-09-21 17:25:41.124791');
INSERT INTO "bitacora_accesos" VALUES(438,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=7_DIAS, Ranking=TODOS','2026-09-21 17:25:41.787333');
INSERT INTO "bitacora_accesos" VALUES(439,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:25:42.703738');
INSERT INTO "bitacora_accesos" VALUES(440,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Sucursal Equipetrol, Rango=TODO, Ranking=TODOS','2026-09-21 17:25:47.131550');
INSERT INTO "bitacora_accesos" VALUES(441,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:25:53.772999');
INSERT INTO "bitacora_accesos" VALUES(442,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:27:19.196946');
INSERT INTO "bitacora_accesos" VALUES(443,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:30:01.824230');
INSERT INTO "bitacora_accesos" VALUES(444,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:30:36.532127');
INSERT INTO "bitacora_accesos" VALUES(445,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 17:33:05.900364');
INSERT INTO "bitacora_accesos" VALUES(446,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-21 18:03:04.916847');
INSERT INTO "bitacora_accesos" VALUES(447,1,'127.0.0.1','FashionStore Dashboard BI Angular 19',1,'CU24 Consulta: Sucursal=Red Global (Todas las Suc, Rango=TODO, Ranking=TODOS','2026-09-21 18:04:08.555545');
INSERT INTO "bitacora_accesos" VALUES(448,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-21 18:04:46.013692');
INSERT INTO "bitacora_accesos" VALUES(449,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-21 18:05:03.413188');
INSERT INTO "bitacora_accesos" VALUES(450,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-21 18:05:04.651390');
INSERT INTO "bitacora_accesos" VALUES(451,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-21 18:06:30.340690');
INSERT INTO "bitacora_accesos" VALUES(452,NULL,'127.0.0.1','Dart/3.13 (dart:io)',0,'Correo no registrado','2026-09-21 18:06:34.709672');
INSERT INTO "bitacora_accesos" VALUES(453,10,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-21 18:08:33.535274');
INSERT INTO "bitacora_accesos" VALUES(454,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-21 18:08:54.886355');
INSERT INTO "bitacora_accesos" VALUES(455,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-21 18:24:30.768938');
INSERT INTO "bitacora_accesos" VALUES(456,6,'127.0.0.1','Dart/3.13 (dart:io)',1,'Login exitoso','2026-09-21 20:13:44.875159');
CREATE TABLE bitacora_auditoria (
	id_auditoria INTEGER NOT NULL, 
	id_usuario INTEGER, 
	accion VARCHAR(100) NOT NULL, 
	ip_cliente VARCHAR(45) NOT NULL, 
	fecha_hora_local DATETIME, 
	metadatos_json TEXT, 
	PRIMARY KEY (id_auditoria), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);
INSERT INTO "bitacora_auditoria" VALUES(1,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.706315','{"puntos_bono": 25, "puntos_actuales": 1820}');
INSERT INTO "bitacora_auditoria" VALUES(2,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 11:55:31.757255','{"puntos_bono": 15, "puntos_actuales": 1835}');
INSERT INTO "bitacora_auditoria" VALUES(3,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.828377','{"puntos_bono": 25, "puntos_actuales": 1860}');
INSERT INTO "bitacora_auditoria" VALUES(4,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.869258','{"puntos_bono": 25, "puntos_actuales": 1885}');
INSERT INTO "bitacora_auditoria" VALUES(5,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.906450','{"puntos_bono": 25, "puntos_actuales": 1910}');
INSERT INTO "bitacora_auditoria" VALUES(6,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.943232','{"puntos_bono": 25, "puntos_actuales": 1935}');
INSERT INTO "bitacora_auditoria" VALUES(7,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:31.979121','{"puntos_bono": 25, "puntos_actuales": 1960}');
INSERT INTO "bitacora_auditoria" VALUES(8,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.017946','{"puntos_bono": 25, "puntos_actuales": 1985}');
INSERT INTO "bitacora_auditoria" VALUES(9,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 11:55:32.072226','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-C92D9C", "puntos_restantes": 1835}');
INSERT INTO "bitacora_auditoria" VALUES(10,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.300725','{"puntos_bono": 25, "puntos_actuales": 1860}');
INSERT INTO "bitacora_auditoria" VALUES(11,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.469093','{"puntos_bono": 25, "puntos_actuales": 1885}');
INSERT INTO "bitacora_auditoria" VALUES(12,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.566808','{"puntos_bono": 25, "puntos_actuales": 1910}');
INSERT INTO "bitacora_auditoria" VALUES(13,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.682468','{"puntos_bono": 25, "puntos_actuales": 1935}');
INSERT INTO "bitacora_auditoria" VALUES(14,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.790098','{"puntos_bono": 25, "puntos_actuales": 1960}');
INSERT INTO "bitacora_auditoria" VALUES(15,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:32.911317','{"puntos_bono": 25, "puntos_actuales": 1985}');
INSERT INTO "bitacora_auditoria" VALUES(16,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:33.069073','{"puntos_bono": 25, "puntos_actuales": 2010}');
INSERT INTO "bitacora_auditoria" VALUES(17,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:33.183142','{"puntos_bono": 25, "puntos_actuales": 2035}');
INSERT INTO "bitacora_auditoria" VALUES(18,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 11:55:33.342550','{"puntos_bono": 25, "puntos_actuales": 2060}');
INSERT INTO "bitacora_auditoria" VALUES(19,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 11:55:33.395111','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-61EC39", "puntos_restantes": 1910}');
INSERT INTO "bitacora_auditoria" VALUES(20,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:05:46.930726','{"puntos_bono": 15, "puntos_actuales": 240}');
INSERT INTO "bitacora_auditoria" VALUES(21,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:05:51.417623','{"puntos_bono": 15, "puntos_actuales": 255}');
INSERT INTO "bitacora_auditoria" VALUES(22,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.540365','{"puntos_bono": 25, "puntos_actuales": 1935}');
INSERT INTO "bitacora_auditoria" VALUES(23,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:24:17.577356','{"puntos_bono": 15, "puntos_actuales": 1950}');
INSERT INTO "bitacora_auditoria" VALUES(24,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.631173','{"puntos_bono": 25, "puntos_actuales": 1975}');
INSERT INTO "bitacora_auditoria" VALUES(25,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.662339','{"puntos_bono": 25, "puntos_actuales": 2000}');
INSERT INTO "bitacora_auditoria" VALUES(26,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.693874','{"puntos_bono": 25, "puntos_actuales": 2025}');
INSERT INTO "bitacora_auditoria" VALUES(27,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.724920','{"puntos_bono": 25, "puntos_actuales": 2050}');
INSERT INTO "bitacora_auditoria" VALUES(28,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.756455','{"puntos_bono": 25, "puntos_actuales": 2075}');
INSERT INTO "bitacora_auditoria" VALUES(29,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.789137','{"puntos_bono": 25, "puntos_actuales": 2100}');
INSERT INTO "bitacora_auditoria" VALUES(30,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 12:24:17.831979','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-369B4B", "puntos_restantes": 1950}');
INSERT INTO "bitacora_auditoria" VALUES(31,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:17.969324','{"puntos_bono": 25, "puntos_actuales": 1975}');
INSERT INTO "bitacora_auditoria" VALUES(32,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.050350','{"puntos_bono": 25, "puntos_actuales": 2000}');
INSERT INTO "bitacora_auditoria" VALUES(33,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.081876','{"puntos_bono": 25, "puntos_actuales": 2025}');
INSERT INTO "bitacora_auditoria" VALUES(34,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.112922','{"puntos_bono": 25, "puntos_actuales": 2050}');
INSERT INTO "bitacora_auditoria" VALUES(35,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.146780','{"puntos_bono": 25, "puntos_actuales": 2075}');
INSERT INTO "bitacora_auditoria" VALUES(36,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.178720','{"puntos_bono": 25, "puntos_actuales": 2100}');
INSERT INTO "bitacora_auditoria" VALUES(37,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.210326','{"puntos_bono": 25, "puntos_actuales": 2125}');
INSERT INTO "bitacora_auditoria" VALUES(38,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.241453','{"puntos_bono": 25, "puntos_actuales": 2150}');
INSERT INTO "bitacora_auditoria" VALUES(39,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:24:18.274205','{"puntos_bono": 25, "puntos_actuales": 2175}');
INSERT INTO "bitacora_auditoria" VALUES(40,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 12:24:18.309397','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-6D2075", "puntos_restantes": 2025}');
INSERT INTO "bitacora_auditoria" VALUES(41,2,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:39:15.812588','{"puntos_bono": 15, "puntos_actuales": 165}');
INSERT INTO "bitacora_auditoria" VALUES(42,2,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:39:22.431597','{"puntos_bono": 15, "puntos_actuales": 180}');
INSERT INTO "bitacora_auditoria" VALUES(43,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.547105','{"puntos_bono": 25, "puntos_actuales": 2050}');
INSERT INTO "bitacora_auditoria" VALUES(44,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:40:16.588098','{"puntos_bono": 15, "puntos_actuales": 2065}');
INSERT INTO "bitacora_auditoria" VALUES(45,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.650717','{"puntos_bono": 25, "puntos_actuales": 2090}');
INSERT INTO "bitacora_auditoria" VALUES(46,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.688130','{"puntos_bono": 25, "puntos_actuales": 2115}');
INSERT INTO "bitacora_auditoria" VALUES(47,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.722694','{"puntos_bono": 25, "puntos_actuales": 2140}');
INSERT INTO "bitacora_auditoria" VALUES(48,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.759691','{"puntos_bono": 25, "puntos_actuales": 2165}');
INSERT INTO "bitacora_auditoria" VALUES(49,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.856046','{"puntos_bono": 25, "puntos_actuales": 2190}');
INSERT INTO "bitacora_auditoria" VALUES(50,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:16.989375','{"puntos_bono": 25, "puntos_actuales": 2215}');
INSERT INTO "bitacora_auditoria" VALUES(51,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 12:40:17.119056','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-7194AF", "puntos_restantes": 2065}');
INSERT INTO "bitacora_auditoria" VALUES(52,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.328165','{"puntos_bono": 25, "puntos_actuales": 2090}');
INSERT INTO "bitacora_auditoria" VALUES(53,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.489118','{"puntos_bono": 25, "puntos_actuales": 2115}');
INSERT INTO "bitacora_auditoria" VALUES(54,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.598466','{"puntos_bono": 25, "puntos_actuales": 2140}');
INSERT INTO "bitacora_auditoria" VALUES(55,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.710198','{"puntos_bono": 25, "puntos_actuales": 2165}');
INSERT INTO "bitacora_auditoria" VALUES(56,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.860363','{"puntos_bono": 25, "puntos_actuales": 2190}');
INSERT INTO "bitacora_auditoria" VALUES(57,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.894630','{"puntos_bono": 25, "puntos_actuales": 2215}');
INSERT INTO "bitacora_auditoria" VALUES(58,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.927899','{"puntos_bono": 25, "puntos_actuales": 2240}');
INSERT INTO "bitacora_auditoria" VALUES(59,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.962084','{"puntos_bono": 25, "puntos_actuales": 2265}');
INSERT INTO "bitacora_auditoria" VALUES(60,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 12:40:17.994662','{"puntos_bono": 25, "puntos_actuales": 2290}');
INSERT INTO "bitacora_auditoria" VALUES(61,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 12:40:18.032233','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-69733C", "puntos_restantes": 2140}');
INSERT INTO "bitacora_auditoria" VALUES(62,2,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:42:44.928374','{"puntos_bono": 15, "puntos_actuales": 195}');
INSERT INTO "bitacora_auditoria" VALUES(63,2,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 12:42:53.382505','{"puntos_bono": 15, "puntos_actuales": 210}');
INSERT INTO "bitacora_auditoria" VALUES(64,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.032984','{"puntos_bono": 25, "puntos_actuales": 2165}');
INSERT INTO "bitacora_auditoria" VALUES(65,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.153370','{"puntos_bono": 25, "puntos_actuales": 2190}');
INSERT INTO "bitacora_auditoria" VALUES(66,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.191394','{"puntos_bono": 25, "puntos_actuales": 2215}');
INSERT INTO "bitacora_auditoria" VALUES(67,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.226086','{"puntos_bono": 25, "puntos_actuales": 2240}');
INSERT INTO "bitacora_auditoria" VALUES(68,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.262761','{"puntos_bono": 25, "puntos_actuales": 2265}');
INSERT INTO "bitacora_auditoria" VALUES(69,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.381335','{"puntos_bono": 25, "puntos_actuales": 2290}');
INSERT INTO "bitacora_auditoria" VALUES(70,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.439906','{"puntos_bono": 25, "puntos_actuales": 2315}');
INSERT INTO "bitacora_auditoria" VALUES(71,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.509739','{"puntos_bono": 25, "puntos_actuales": 2340}');
INSERT INTO "bitacora_auditoria" VALUES(72,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:13.579966','{"puntos_bono": 25, "puntos_actuales": 2365}');
INSERT INTO "bitacora_auditoria" VALUES(73,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 13:01:13.679449','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-4DA540", "puntos_restantes": 2215}');
INSERT INTO "bitacora_auditoria" VALUES(74,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.121000','{"puntos_bono": 25, "puntos_actuales": 2240}');
INSERT INTO "bitacora_auditoria" VALUES(75,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 13:01:14.160282','{"puntos_bono": 15, "puntos_actuales": 2255}');
INSERT INTO "bitacora_auditoria" VALUES(76,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.227929','{"puntos_bono": 25, "puntos_actuales": 2280}');
INSERT INTO "bitacora_auditoria" VALUES(77,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.265015','{"puntos_bono": 25, "puntos_actuales": 2305}');
INSERT INTO "bitacora_auditoria" VALUES(78,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.298019','{"puntos_bono": 25, "puntos_actuales": 2330}');
INSERT INTO "bitacora_auditoria" VALUES(79,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.333834','{"puntos_bono": 25, "puntos_actuales": 2355}');
INSERT INTO "bitacora_auditoria" VALUES(80,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.368246','{"puntos_bono": 25, "puntos_actuales": 2380}');
INSERT INTO "bitacora_auditoria" VALUES(81,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 13:01:14.404310','{"puntos_bono": 25, "puntos_actuales": 2405}');
INSERT INTO "bitacora_auditoria" VALUES(82,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 13:01:14.445012','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-039F8B", "puntos_restantes": 2255}');
INSERT INTO "bitacora_auditoria" VALUES(83,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:58.944948','{"puntos_bono": 25, "puntos_actuales": 2280}');
INSERT INTO "bitacora_auditoria" VALUES(84,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.040493','{"puntos_bono": 25, "puntos_actuales": 2305}');
INSERT INTO "bitacora_auditoria" VALUES(85,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.075969','{"puntos_bono": 25, "puntos_actuales": 2330}');
INSERT INTO "bitacora_auditoria" VALUES(86,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.108325','{"puntos_bono": 25, "puntos_actuales": 2355}');
INSERT INTO "bitacora_auditoria" VALUES(87,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.142577','{"puntos_bono": 25, "puntos_actuales": 2380}');
INSERT INTO "bitacora_auditoria" VALUES(88,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.206279','{"puntos_bono": 25, "puntos_actuales": 2405}');
INSERT INTO "bitacora_auditoria" VALUES(89,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.253822','{"puntos_bono": 25, "puntos_actuales": 2430}');
INSERT INTO "bitacora_auditoria" VALUES(90,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.297381','{"puntos_bono": 25, "puntos_actuales": 2455}');
INSERT INTO "bitacora_auditoria" VALUES(91,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.355181','{"puntos_bono": 25, "puntos_actuales": 2480}');
INSERT INTO "bitacora_auditoria" VALUES(92,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 15:04:59.416298','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-57C775", "puntos_restantes": 2330}');
INSERT INTO "bitacora_auditoria" VALUES(93,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.808219','{"puntos_bono": 25, "puntos_actuales": 2355}');
INSERT INTO "bitacora_auditoria" VALUES(94,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-20 15:04:59.849380','{"puntos_bono": 15, "puntos_actuales": 2370}');
INSERT INTO "bitacora_auditoria" VALUES(95,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.917434','{"puntos_bono": 25, "puntos_actuales": 2395}');
INSERT INTO "bitacora_auditoria" VALUES(96,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.958825','{"puntos_bono": 25, "puntos_actuales": 2420}');
INSERT INTO "bitacora_auditoria" VALUES(97,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:04:59.993342','{"puntos_bono": 25, "puntos_actuales": 2445}');
INSERT INTO "bitacora_auditoria" VALUES(98,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:05:00.041039','{"puntos_bono": 25, "puntos_actuales": 2470}');
INSERT INTO "bitacora_auditoria" VALUES(99,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:05:00.080739','{"puntos_bono": 25, "puntos_actuales": 2495}');
INSERT INTO "bitacora_auditoria" VALUES(100,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-20 15:05:00.116057','{"puntos_bono": 25, "puntos_actuales": 2520}');
INSERT INTO "bitacora_auditoria" VALUES(101,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-20 15:05:00.157080','{"codigo_recompensa": "ENVIO_FREE", "costo_puntos": 150, "codigo_cupon": "FS-ENVIO_FREE-4EF899", "puntos_restantes": 2370}');
INSERT INTO "bitacora_auditoria" VALUES(102,1,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-20 19:52:12.768076','{"monto_total_bs": 676.0, "puntos_ganados": 67, "canal": "WEB", "puntos_actuales": 322, "nivel_anterior": "BRONCE", "nuevo_nivel": "BRONCE"}');
INSERT INTO "bitacora_auditoria" VALUES(103,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 10:10:34.991786','{"puntos_bono": 15, "puntos_actuales": 2385}');
INSERT INTO "bitacora_auditoria" VALUES(104,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-21 10:10:52.680453','{"codigo_recompensa": "DESC_50BS", "costo_puntos": 300, "codigo_cupon": "FS-DESC_50BS-7806B4", "puntos_restantes": 2085}');
INSERT INTO "bitacora_auditoria" VALUES(105,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 10:13:11.094117','{"puntos_bono": 15, "puntos_actuales": 2100}');
INSERT INTO "bitacora_auditoria" VALUES(106,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 10:13:20.830748','{"puntos_bono": 25, "puntos_actuales": 2125}');
INSERT INTO "bitacora_auditoria" VALUES(107,6,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:13:34.074906','{"puntos_bono": 20, "puntos_actuales": 2145}');
INSERT INTO "bitacora_auditoria" VALUES(108,6,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:14:26.131542','{"puntos_bono": 20, "puntos_actuales": 2165}');
INSERT INTO "bitacora_auditoria" VALUES(109,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:15:01.832579','{"puntos_bono": 20, "puntos_actuales": 342}');
INSERT INTO "bitacora_auditoria" VALUES(110,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 10:15:11.083780','{"puntos_bono": 15, "puntos_actuales": 357}');
INSERT INTO "bitacora_auditoria" VALUES(111,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:15:19.007029','{"puntos_bono": 20, "puntos_actuales": 377}');
INSERT INTO "bitacora_auditoria" VALUES(112,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 10:16:46.543730','{"puntos_bono": 15, "puntos_actuales": 392}');
INSERT INTO "bitacora_auditoria" VALUES(113,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:17:47.989273','{"puntos_bono": 20, "puntos_actuales": 412}');
INSERT INTO "bitacora_auditoria" VALUES(114,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:26:12.308028','{"puntos_bono": 20, "puntos_actuales": 432}');
INSERT INTO "bitacora_auditoria" VALUES(115,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:26:21.640653','{"puntos_bono": 20, "puntos_actuales": 452}');
INSERT INTO "bitacora_auditoria" VALUES(116,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:26:26.243917','{"puntos_bono": 20, "puntos_actuales": 472}');
INSERT INTO "bitacora_auditoria" VALUES(117,1,'BONO_ACCION_COMPARTIR_LOOK','127.0.0.1','2026-09-21 10:27:19.726534','{"puntos_bono": 20, "puntos_actuales": 492}');
INSERT INTO "bitacora_auditoria" VALUES(118,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 12:23:50.759120','{"puntos_bono": 15, "puntos_actuales": 507}');
INSERT INTO "bitacora_auditoria" VALUES(119,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 12:24:07.543927','{"puntos_bono": 15, "puntos_actuales": 522}');
INSERT INTO "bitacora_auditoria" VALUES(120,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 12:39:20.742205','{"puntos_bono": 15, "puntos_actuales": 537}');
INSERT INTO "bitacora_auditoria" VALUES(121,1,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 12:54:39.159024','{"puntos_bono": 15, "puntos_actuales": 552}');
INSERT INTO "bitacora_auditoria" VALUES(122,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 14:03:09.705010','{"puntos_bono": 25, "puntos_actuales": 2190}');
INSERT INTO "bitacora_auditoria" VALUES(123,13,'CREACION_PERFIL_GAMIFICACION','127.0.0.1','2026-09-21 14:11:35.148429','{"puntos_iniciales": 100, "nivel": "BRONCE"}');
INSERT INTO "bitacora_auditoria" VALUES(124,13,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 14:11:35.172815','{"puntos_bono": 25, "puntos_actuales": 125}');
INSERT INTO "bitacora_auditoria" VALUES(125,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 16:16:36.377271','{"puntos_bono": 25, "puntos_actuales": 2215}');
INSERT INTO "bitacora_auditoria" VALUES(126,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 16:32:55.849108','{"puntos_bono": 25, "puntos_actuales": 2240}');
INSERT INTO "bitacora_auditoria" VALUES(127,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 16:49:13.508913','{"puntos_bono": 25, "puntos_actuales": 2265}');
INSERT INTO "bitacora_auditoria" VALUES(128,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 16:50:35.751125','{"puntos_bono": 25, "puntos_actuales": 2290}');
INSERT INTO "bitacora_auditoria" VALUES(129,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 16:58:07.777085','{"puntos_bono": 15, "puntos_actuales": 2305}');
INSERT INTO "bitacora_auditoria" VALUES(130,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 16:58:17.089939','{"puntos_bono": 15, "puntos_actuales": 2320}');
INSERT INTO "bitacora_auditoria" VALUES(131,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 17:54:10.410027','{"monto_total_bs": 294.5, "puntos_ganados": 29, "canal": "APP", "puntos_actuales": 2349, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(132,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 17:55:09.746863','{"monto_total_bs": 437.0, "puntos_ganados": 43, "canal": "APP", "puntos_actuales": 2392, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(133,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 17:55:39.917792','{"monto_total_bs": 462.0, "puntos_ganados": 46, "canal": "APP", "puntos_actuales": 2438, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(134,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 17:56:19.088883','{"monto_total_bs": 1051.0, "puntos_ganados": 105, "canal": "APP", "puntos_actuales": 2543, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(135,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 18:03:43.934314','{"puntos_bono": 25, "puntos_actuales": 2568}');
INSERT INTO "bitacora_auditoria" VALUES(136,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 18:04:16.295716','{"monto_total_bs": 319.5, "puntos_ganados": 31, "canal": "APP", "puntos_actuales": 2599, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(137,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 18:48:23.762932','{"monto_total_bs": 956.0, "puntos_ganados": 95, "canal": "APP", "puntos_actuales": 2694, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(138,6,'CANJE_RECOMPENSA_EXITOSO','127.0.0.1','2026-09-21 18:58:08.660811','{"codigo_recompensa": "CUPON_25BS", "costo_puntos": 200, "codigo_cupon": "FS-CUPON_25BS-420119", "puntos_restantes": 2494}');
INSERT INTO "bitacora_auditoria" VALUES(139,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 20:37:54.024059','{"monto_total_bs": 341.0, "puntos_ganados": 34, "canal": "APP", "puntos_actuales": 2528, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(140,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 20:38:51.016763','{"monto_total_bs": 269.5, "puntos_ganados": 26, "canal": "APP", "puntos_actuales": 2554, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(141,6,'BONO_ACCION_BUSQUEDA_VOZ','127.0.0.1','2026-09-21 20:39:33.271424','{"puntos_bono": 15, "puntos_actuales": 2569}');
INSERT INTO "bitacora_auditoria" VALUES(142,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 20:52:33.184886','{"puntos_bono": 25, "puntos_actuales": 2594}');
INSERT INTO "bitacora_auditoria" VALUES(143,6,'PUNTOS_POR_COMPRA','127.0.0.1','2026-09-21 20:54:04.197678','{"monto_total_bs": 269.5, "puntos_ganados": 26, "canal": "APP", "puntos_actuales": 2620, "nivel_anterior": "DIAMANTE", "nuevo_nivel": "DIAMANTE"}');
INSERT INTO "bitacora_auditoria" VALUES(144,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 21:40:10.205835','{"puntos_bono": 25, "puntos_actuales": 2645}');
INSERT INTO "bitacora_auditoria" VALUES(145,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:24:23.931067','{"puntos_bono": 25, "puntos_actuales": 2670}');
INSERT INTO "bitacora_auditoria" VALUES(146,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:25:00.743555','{"puntos_bono": 25, "puntos_actuales": 2695}');
INSERT INTO "bitacora_auditoria" VALUES(147,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:29:01.115109','{"puntos_bono": 25, "puntos_actuales": 2720}');
INSERT INTO "bitacora_auditoria" VALUES(148,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:33:17.299243','{"puntos_bono": 25, "puntos_actuales": 2745}');
INSERT INTO "bitacora_auditoria" VALUES(149,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:34:04.237109','{"puntos_bono": 25, "puntos_actuales": 2770}');
INSERT INTO "bitacora_auditoria" VALUES(150,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:34:57.438243','{"puntos_bono": 25, "puntos_actuales": 2795}');
INSERT INTO "bitacora_auditoria" VALUES(151,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:36:55.168289','{"puntos_bono": 25, "puntos_actuales": 2820}');
INSERT INTO "bitacora_auditoria" VALUES(152,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:46:26.833182','{"puntos_bono": 25, "puntos_actuales": 2845}');
INSERT INTO "bitacora_auditoria" VALUES(153,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:48:26.724581','{"puntos_bono": 25, "puntos_actuales": 2870}');
INSERT INTO "bitacora_auditoria" VALUES(154,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:49:12.558537','{"puntos_bono": 25, "puntos_actuales": 2895}');
INSERT INTO "bitacora_auditoria" VALUES(155,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:51:03.023291','{"puntos_bono": 25, "puntos_actuales": 2920}');
INSERT INTO "bitacora_auditoria" VALUES(156,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:51:09.363809','{"puntos_bono": 25, "puntos_actuales": 2945}');
INSERT INTO "bitacora_auditoria" VALUES(157,6,'BONO_ACCION_PROBAR_RA','127.0.0.1','2026-09-21 22:54:32.468544','{"puntos_bono": 25, "puntos_actuales": 2970}');
CREATE TABLE carrito_items (
	id_item INTEGER NOT NULL, 
	id_carrito INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, 
	color VARCHAR(50) NOT NULL, 
	cantidad INTEGER NOT NULL, 
	precio_unitario NUMERIC(10, 2) NOT NULL, 
	agregado_en DATETIME, 
	PRIMARY KEY (id_item), 
	FOREIGN KEY(id_carrito) REFERENCES carritos (id_carrito) ON DELETE CASCADE, 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
);
CREATE TABLE carritos (
	id_carrito INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	estado VARCHAR(30) NOT NULL, 
	creado_en DATETIME, 
	actualizado_en DATETIME, 
	PRIMARY KEY (id_carrito), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);
INSERT INTO "carritos" VALUES(1,6,'ACTIVO','2026-09-19 16:12:21.279899','2026-09-19 16:12:21.279917');
INSERT INTO "carritos" VALUES(2,2,'ACTIVO','2026-09-20 15:28:54.342486','2026-09-20 15:28:54.342499');
INSERT INTO "carritos" VALUES(3,1,'ACTIVO','2026-09-20 15:43:58.132908','2026-09-20 15:43:58.132920');
INSERT INTO "carritos" VALUES(4,5,'ACTIVO','2026-09-20 21:36:52.622945','2026-09-20 21:36:52.622956');
INSERT INTO "carritos" VALUES(5,10,'ACTIVO','2026-09-21 18:08:33.585093','2026-09-21 18:08:33.585109');
INSERT INTO "carritos" VALUES(6,13,'ACTIVO','2026-09-21 18:11:47.350816','2026-09-21 18:11:47.350827');
CREATE TABLE categorias (
	id_categoria INTEGER NOT NULL, 
	nombre_categoria VARCHAR(50) NOT NULL, 
	descripcion VARCHAR(200), 
	PRIMARY KEY (id_categoria), 
	UNIQUE (nombre_categoria)
);
INSERT INTO "categorias" VALUES(1,'Camisas Formales','Camisas ejecutivas y de vestir en algodón peinado y lino');
INSERT INTO "categorias" VALUES(2,'Pantalones Casuales','Pantalones estilo chino, gabardina y corte clásico');
INSERT INTO "categorias" VALUES(3,'Trajes y Blazers','Sacos, chaquetas y trajes de dos piezas en lana fría');
INSERT INTO "categorias" VALUES(4,'Calzado Ejecutivo','Zapatos Oxford, Derby y mocasines de cuero legítimo');
CREATE TABLE ciudades (
	id_ciudad INTEGER NOT NULL, 
	nombre_ciudad VARCHAR(50) NOT NULL, 
	departamento VARCHAR(50) NOT NULL, 
	PRIMARY KEY (id_ciudad)
);
INSERT INTO "ciudades" VALUES(1,'Santa Cruz de la Sierra','Santa Cruz');
INSERT INTO "ciudades" VALUES(2,'La Paz','La Paz');
INSERT INTO "ciudades" VALUES(3,'Cochabamba','Cochabamba');
CREATE TABLE cupones_fidelizacion (
	id_cupon INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	codigo_cupon VARCHAR(50) NOT NULL, 
	monto_descuento NUMERIC(10, 2) NOT NULL, 
	tipo_beneficio VARCHAR(50) NOT NULL, 
	utilizado BOOLEAN NOT NULL, 
	fecha_emision DATETIME, 
	fecha_expiracion DATETIME NOT NULL, 
	PRIMARY KEY (id_cupon), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE, 
	UNIQUE (codigo_cupon)
);
INSERT INTO "cupones_fidelizacion" VALUES(1,6,'FS-ENVIO_FREE-C92D9C',25,'ENVIO_GRATIS',0,'2026-09-20 15:55:32.052025','2026-10-20 15:55:32.052032');
INSERT INTO "cupones_fidelizacion" VALUES(2,6,'FS-ENVIO_FREE-61EC39',25,'ENVIO_GRATIS',0,'2026-09-20 15:55:33.378854','2026-10-20 15:55:33.378861');
INSERT INTO "cupones_fidelizacion" VALUES(3,6,'FS-ENVIO_FREE-369B4B',25,'ENVIO_GRATIS',0,'2026-09-20 16:24:17.818342','2026-10-20 16:24:17.818347');
INSERT INTO "cupones_fidelizacion" VALUES(4,6,'FS-ENVIO_FREE-6D2075',25,'ENVIO_GRATIS',0,'2026-09-20 16:24:18.298821','2026-10-20 16:24:18.298827');
INSERT INTO "cupones_fidelizacion" VALUES(5,6,'FS-ENVIO_FREE-7194AF',25,'ENVIO_GRATIS',0,'2026-09-20 16:40:17.055494','2026-10-20 16:40:17.055499');
INSERT INTO "cupones_fidelizacion" VALUES(6,6,'FS-ENVIO_FREE-69733C',25,'ENVIO_GRATIS',0,'2026-09-20 16:40:18.019956','2026-10-20 16:40:18.019961');
INSERT INTO "cupones_fidelizacion" VALUES(7,6,'FS-ENVIO_FREE-4DA540',25,'ENVIO_GRATIS',0,'2026-09-20 17:01:13.662155','2026-10-20 17:01:13.662163');
INSERT INTO "cupones_fidelizacion" VALUES(8,6,'FS-ENVIO_FREE-039F8B',25,'ENVIO_GRATIS',0,'2026-09-20 17:01:14.433488','2026-10-20 17:01:14.433496');
INSERT INTO "cupones_fidelizacion" VALUES(9,6,'FS-ENVIO_FREE-57C775',25,'ENVIO_GRATIS',0,'2026-09-20 19:04:59.395444','2026-10-20 19:04:59.395451');
INSERT INTO "cupones_fidelizacion" VALUES(10,6,'FS-ENVIO_FREE-4EF899',25,'ENVIO_GRATIS',0,'2026-09-20 19:05:00.144911','2026-10-20 19:05:00.144917');
INSERT INTO "cupones_fidelizacion" VALUES(11,6,'FS-DESC_50BS-7806B4',50,'DESCUENTO_MONTO',1,'2026-09-21 14:10:52.659657','2026-10-21 14:10:52.659665');
INSERT INTO "cupones_fidelizacion" VALUES(12,6,'FS-CUPON_25BS-420119',25,'DESCUENTO_MONTO',1,'2026-09-21 22:58:08.634429','2026-10-21 22:58:08.634437');
CREATE TABLE devolucion_detalles (
	id_detalle_devolucion INTEGER NOT NULL, 
	id_devolucion INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, 
	color VARCHAR(50) NOT NULL, 
	cantidad INTEGER NOT NULL, 
	costo_historico_cpp NUMERIC(10, 2) NOT NULL, 
	precio_unitario_original NUMERIC(10, 2) NOT NULL, 
	estado_fisico VARCHAR(30) NOT NULL, 
	nuevo_producto_cambio_id INTEGER, 
	nueva_talla VARCHAR(20), 
	nuevo_color VARCHAR(50), 
	PRIMARY KEY (id_detalle_devolucion), 
	FOREIGN KEY(id_devolucion) REFERENCES devoluciones (id_devolucion) ON DELETE CASCADE, 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE RESTRICT, 
	FOREIGN KEY(nuevo_producto_cambio_id) REFERENCES productos (id_producto) ON DELETE RESTRICT
);
INSERT INTO "devolucion_detalles" VALUES(1,1,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(2,2,1,'M','Negro',1,107.14,150,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(3,3,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(4,4,1,'M','Negro',1,107.14,150,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(5,5,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(6,6,1,'M','Negro',1,107.14,150,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(7,7,7,'S','Blanco Puro',1,112.5,310,'APTO_VENTA',7,'L','Azul Cobalto');
INSERT INTO "devolucion_detalles" VALUES(8,8,7,'S','Blanco Puro',1,112.5,310,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(9,9,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(10,10,1,'S','Blanco Puro',1,110,250,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(11,11,1,'L','Azul Noche',1,95,190,'DEFECTUOSO_MERMA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(12,12,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(13,13,1,'M','Negro',1,126,150,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(14,14,1,'S','Blanco Puro',1,110,250,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(15,15,1,'L','Azul Noche',1,95,190,'DEFECTUOSO_MERMA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(16,16,1,'M','Azul Marino',1,107.14,280,'APTO_VENTA',1,'L','Blanco Óptico');
INSERT INTO "devolucion_detalles" VALUES(17,17,1,'M','Negro',1,126,150,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(18,18,1,'S','Blanco Puro',1,110,250,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(19,19,1,'L','Azul Noche',1,95,190,'DEFECTUOSO_MERMA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(20,20,1,'M','Azul Marino',1,107.14,180,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(21,21,1,'M','Azul Marino',1,107.14,180,'APTO_VENTA',NULL,NULL,NULL);
INSERT INTO "devolucion_detalles" VALUES(22,22,1,'M','Azul Marino',1,107.14,180,'APTO_VENTA',1,'L','Blanco Óptico');
CREATE TABLE devoluciones (
	id_devolucion INTEGER NOT NULL, 
	tenant_id VARCHAR(50) NOT NULL, 
	id_orden INTEGER NOT NULL, 
	id_sucursal INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	nro_ticket_original VARCHAR(50) NOT NULL, 
	nro_devolucion VARCHAR(50) NOT NULL, 
	fecha_devolucion DATETIME NOT NULL, 
	motivo VARCHAR(150) NOT NULL, 
	tipo_resolucion VARCHAR(30) NOT NULL, 
	total_devuelto NUMERIC(10, 2) NOT NULL, 
	diferencia_cobrada NUMERIC(10, 2) NOT NULL, 
	codigo_vale VARCHAR(50), 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id_devolucion), 
	FOREIGN KEY(id_orden) REFERENCES ordenes_venta (id_orden) ON DELETE RESTRICT, 
	FOREIGN KEY(id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE RESTRICT, 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE RESTRICT
);
INSERT INTO "devoluciones" VALUES(1,'fashionstore_scz',3,1,1,'POS-CAMBIO-1790012382','DEV-2026-064DE2','2026-09-21 13:39:42.728390','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(2,'fashionstore_scz',4,1,1,'POS-VALE-1790012382','DEV-2026-6C8861','2026-09-21 13:39:42.815446','Preferencia del cliente','VALE_CREDITO',150,0,'VALE-FS-F79FA198','COMPLETADA');
INSERT INTO "devoluciones" VALUES(3,'fashionstore_scz',7,1,1,'POS-CAMBIO-1790012503','DEV-2026-7E144B','2026-09-21 13:41:43.081335','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(4,'fashionstore_scz',8,1,1,'POS-VALE-1790012503','DEV-2026-5E28FB','2026-09-21 13:41:43.190232','Preferencia del cliente','VALE_CREDITO',150,0,'VALE-FS-62CA4C6A','COMPLETADA');
INSERT INTO "devoluciones" VALUES(5,'fashionstore_scz',12,1,1,'POS-CAMBIO-1790012605','DEV-2026-5CDE0E','2026-09-21 13:43:25.710779','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(6,'fashionstore_scz',13,1,1,'POS-VALE-1790012605','DEV-2026-4EB1F0','2026-09-21 13:43:25.805391','Preferencia del cliente','VALE_CREDITO',150,0,'VALE-FS-6D511FC4','COMPLETADA');
INSERT INTO "devoluciones" VALUES(7,'fashionstore_scz',15,1,1,'RES-54e9f0a0-93ff-4876-b7ec-fd86cfcd3dc8-1','DEV-2026-F169E4','2026-09-21 13:56:56.343541','Cambio de talla por ajuste ergonómico','CAMBIO_VARIANTE',310,15.5,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(8,'fashionstore_scz',15,1,1,'RES-54e9f0a0-93ff-4876-b7ec-fd86cfcd3dc8-1','DEV-2026-8B51A7','2026-09-21 14:03:11.616727','Preferencia de color o estilo','REEMBOLSO_EFECTIVO',310,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(9,'fashionstore_scz',17,1,1,'POS-CAMBIO-1790014001','DEV-2026-A472A7','2026-09-21 14:06:41.959995','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(10,'fashionstore_scz',20,1,1,'POS-REEMB-1790014002','DEV-2026-6635B2','2026-09-21 14:06:42.652751','Cliente desistió de la compra, solicita dinero en efectivo','REEMBOLSO_EFECTIVO',250,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(11,'fashionstore_scz',21,1,1,'POS-MERMA-1790014002','DEV-2026-4CEE99','2026-09-21 14:06:42.727824','Costura descosida de fábrica (Merma)','REEMBOLSO_EFECTIVO',190,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(12,'fashionstore_scz',27,1,1,'POS-CAMBIO-1790014125','DEV-2026-29001F','2026-09-21 14:08:45.599629','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(13,'fashionstore_scz',28,1,1,'POS-VALE-1790014125','DEV-2026-F5F17E','2026-09-21 14:08:45.705004','Preferencia del cliente','VALE_CREDITO',150,0,'VALE-FS-67D2069D','COMPLETADA');
INSERT INTO "devoluciones" VALUES(14,'fashionstore_scz',30,1,1,'POS-REEMB-1790014125','DEV-2026-E2370C','2026-09-21 14:08:45.796218','Cliente desistió de la compra, solicita dinero en efectivo','REEMBOLSO_EFECTIVO',250,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(15,'fashionstore_scz',31,1,1,'POS-MERMA-1790014125','DEV-2026-2AF92F','2026-09-21 14:08:45.857885','Costura descosida de fábrica (Merma)','REEMBOLSO_EFECTIVO',190,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(16,'fashionstore_scz',33,1,1,'POS-CAMBIO-1790015142','DEV-2026-A0916B','2026-09-21 14:25:42.845657','Cambio por talla L','CAMBIO_VARIANTE',280,14,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(17,'fashionstore_scz',34,1,1,'POS-VALE-1790015142','DEV-2026-65DBB3','2026-09-21 14:25:42.936898','Preferencia del cliente','VALE_CREDITO',150,0,'VALE-FS-7D3BA1B7','COMPLETADA');
INSERT INTO "devoluciones" VALUES(18,'fashionstore_scz',36,1,1,'POS-REEMB-1790015143','DEV-2026-4D9BE4','2026-09-21 14:25:43.031377','Cliente desistió de la compra, solicita dinero en efectivo','REEMBOLSO_EFECTIVO',250,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(19,'fashionstore_scz',37,1,1,'POS-MERMA-1790015143','DEV-2026-D33960','2026-09-21 14:25:43.084106','Costura descosida de fábrica (Merma)','REEMBOLSO_EFECTIVO',190,0,NULL,'COMPLETADA');
INSERT INTO "devoluciones" VALUES(20,'1',1,1,1,'POS-2026-0042','DEV-2026-0012','2026-09-20 11:15:00','Talla no adecuada','REEMBOLSO_EFECTIVO',180,0,NULL,'APROBADA');
INSERT INTO "devoluciones" VALUES(21,'1',1,1,1,'POS-2026-0055','DEV-2026-0025','2026-09-20 16:30:00','Preferencia de color','VALE_CREDITO',180,0,NULL,'APROBADA');
INSERT INTO "devoluciones" VALUES(22,'1',1,1,1,'POS-2026-0099','DEV-2026-0038','2026-09-21 10:45:00','Cambio por talla L Blanco Óptico','CAMBIO_VARIANTE',180,0,NULL,'APROBADA');
CREATE TABLE gamificacion_perfiles (
	id_perfil INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	puntos_actuales INTEGER NOT NULL, 
	puntos_historicos INTEGER NOT NULL, 
	nivel VARCHAR(30) NOT NULL, 
	insignias_json TEXT NOT NULL, 
	beneficios_canjeados_json TEXT NOT NULL, 
	actualizado_en DATETIME, tenant_id VARCHAR(50) DEFAULT 'fashionstore_scz', 
	PRIMARY KEY (id_perfil), 
	UNIQUE (id_usuario), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);
INSERT INTO "gamificacion_perfiles" VALUES(1,6,2970,6620,'DIAMANTE','["vestidor_3d", "cliente_distinguido", "explorador_voz", "coleccionista_elite", "reserva_boutique", "primer_pedido"]','[{"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-70A7B0", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-48B4F5", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-897477", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-565240", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-02D37D", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-4EC076", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-3D2EF1", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-35F127", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-7B4DE6", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-072DB3", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-45ADA6", "costo": 150}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-C92D9C", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-61EC39", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-369B4B", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-6D2075", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-7194AF", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-69733C", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-4DA540", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-039F8B", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-57C775", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "ENVIO_FREE", "cupon": "FS-ENVIO_FREE-4EF899", "costo": 150, "descuento_monto": 25.0}, {"codigo_recompensa": "DESC_50BS", "cupon": "FS-DESC_50BS-7806B4", "costo": 300, "descuento_monto": 50.0}, {"codigo_recompensa": "CUPON_25BS", "cupon": "FS-CUPON_25BS-420119", "costo": 200, "descuento_monto": 25.0}]','2026-09-22 02:54:32.459380','fashionstore_scz');
INSERT INTO "gamificacion_perfiles" VALUES(2,1,552,552,'PLATA','["vestidor_3d", "explorador_voz", "primer_pedido", "reserva_boutique", "cliente_distinguido"]','[]','2026-09-21 16:54:47.088296','fashionstore_scz');
INSERT INTO "gamificacion_perfiles" VALUES(3,2,210,210,'BRONCE','["vestidor_3d", "explorador_voz"]','[]','2026-09-20 16:42:53.363614','fashionstore_scz');
INSERT INTO "gamificacion_perfiles" VALUES(4,13,125,125,'BRONCE','["vestidor_3d"]','[]','2026-09-21 18:11:35.162982','fashionstore_scz');
CREATE TABLE inventario (
	id_inventario INTEGER NOT NULL, 
	id_sucursal INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, 
	color VARCHAR(50) NOT NULL, 
	stock_fisico INTEGER NOT NULL, 
	stock_reservado INTEGER NOT NULL, 
	stock_disponible INTEGER NOT NULL, 
	stock_minimo INTEGER NOT NULL, 
	ultimo_costo_compra NUMERIC(10, 2) NOT NULL, 
	costo_promedio_ponderado NUMERIC(10, 2) NOT NULL, 
	actualizado_en DATETIME, 
	PRIMARY KEY (id_inventario), 
	FOREIGN KEY(id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE CASCADE, 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
);
INSERT INTO "inventario" VALUES(1,1,1,'M','Azul Marino',44,0,44,10,120,107.14,'2026-09-21 16:10:44.532156');
INSERT INTO "inventario" VALUES(2,1,1,'L','Blanco Óptico',19,0,19,5,110,110,'2026-09-21 14:25:42.864182');
INSERT INTO "inventario" VALUES(3,1,2,'32','Beige Arena',20,0,20,5,140,135,'2026-09-21 16:09:13.513753');
INSERT INTO "inventario" VALUES(4,3,1,'M','Azul Marino',15,0,15,5,115,115,'2026-09-18 18:41:52.035166');
INSERT INTO "inventario" VALUES(5,4,3,'40','Gris Plomo',8,0,8,2,320,310,'2026-09-21 16:01:22.681168');
INSERT INTO "inventario" VALUES(6,1,1,'S','Azul Marino',20,0,20,5,99,99,'2026-09-18 18:41:52.099852');
INSERT INTO "inventario" VALUES(7,1,1,'S','Blanco Óptico',20,0,20,5,99,99,'2026-09-18 18:41:52.099859');
INSERT INTO "inventario" VALUES(8,1,1,'S','Celeste Cielo',20,0,20,5,99,99,'2026-09-18 18:41:52.099862');
INSERT INTO "inventario" VALUES(9,1,1,'M','Blanco Óptico',20,0,20,5,110,110,'2026-09-18 18:41:52.099864');
INSERT INTO "inventario" VALUES(10,1,1,'M','Celeste Cielo',20,0,20,5,110,110,'2026-09-18 18:41:52.099866');
INSERT INTO "inventario" VALUES(11,1,1,'L','Azul Marino',20,0,20,5,121,121,'2026-09-18 18:41:52.099868');
INSERT INTO "inventario" VALUES(12,1,1,'L','Celeste Cielo',20,0,20,5,121,121,'2026-09-18 18:41:52.099871');
INSERT INTO "inventario" VALUES(13,1,1,'XL','Azul Marino',20,0,20,5,132,132,'2026-09-18 18:41:52.099873');
INSERT INTO "inventario" VALUES(14,1,1,'XL','Blanco Óptico',20,0,20,5,132,132,'2026-09-18 18:41:52.099875');
INSERT INTO "inventario" VALUES(15,1,1,'XL','Celeste Cielo',20,0,20,5,132,132,'2026-09-18 18:41:52.099877');
INSERT INTO "inventario" VALUES(16,1,2,'30','Beige Arena',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.099879');
INSERT INTO "inventario" VALUES(17,1,2,'30','Azul Noche',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.099881');
INSERT INTO "inventario" VALUES(18,1,2,'30','Verde Oliva',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.099883');
INSERT INTO "inventario" VALUES(19,1,2,'32','Azul Noche',20,0,20,5,130,130,'2026-09-18 18:41:52.099885');
INSERT INTO "inventario" VALUES(20,1,2,'32','Verde Oliva',20,0,20,5,130,130,'2026-09-18 18:41:52.099887');
INSERT INTO "inventario" VALUES(21,1,2,'34','Beige Arena',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.099889');
INSERT INTO "inventario" VALUES(22,1,2,'34','Azul Noche',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.099891');
INSERT INTO "inventario" VALUES(23,1,2,'34','Verde Oliva',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.099893');
INSERT INTO "inventario" VALUES(24,1,2,'36','Beige Arena',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.099895');
INSERT INTO "inventario" VALUES(25,1,2,'36','Azul Noche',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.099897');
INSERT INTO "inventario" VALUES(26,1,2,'36','Verde Oliva',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.099899');
INSERT INTO "inventario" VALUES(27,1,3,'38','Azul Cobalto',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.099901');
INSERT INTO "inventario" VALUES(28,1,3,'38','Gris Plomo',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.099903');
INSERT INTO "inventario" VALUES(29,1,3,'40','Azul Cobalto',20,0,20,5,280,280,'2026-09-18 18:41:52.099905');
INSERT INTO "inventario" VALUES(30,1,3,'40','Gris Plomo',20,0,20,5,280,280,'2026-09-18 18:41:52.099907');
INSERT INTO "inventario" VALUES(31,1,3,'42','Azul Cobalto',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.099909');
INSERT INTO "inventario" VALUES(32,1,3,'42','Gris Plomo',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.099911');
INSERT INTO "inventario" VALUES(33,1,4,'39','Negro Clásico',20,0,20,5,235,235,'2026-09-18 18:41:52.099913');
INSERT INTO "inventario" VALUES(34,1,4,'39','Marrón Suizo',20,0,20,5,235,235,'2026-09-18 18:41:52.099914');
INSERT INTO "inventario" VALUES(35,1,4,'39','Cognac',20,0,20,5,235,235,'2026-09-18 18:41:52.099916');
INSERT INTO "inventario" VALUES(36,1,4,'40','Negro Clásico',20,0,20,5,250,250,'2026-09-18 18:41:52.099918');
INSERT INTO "inventario" VALUES(37,1,4,'40','Marrón Suizo',20,0,20,5,250,250,'2026-09-18 18:41:52.099920');
INSERT INTO "inventario" VALUES(38,1,4,'40','Cognac',20,0,20,5,250,250,'2026-09-18 18:41:52.099922');
INSERT INTO "inventario" VALUES(39,1,4,'41','Negro Clásico',20,0,20,5,265,265,'2026-09-18 18:41:52.099924');
INSERT INTO "inventario" VALUES(40,1,4,'41','Marrón Suizo',20,0,20,5,265,265,'2026-09-18 18:41:52.099926');
INSERT INTO "inventario" VALUES(41,1,4,'41','Cognac',20,0,20,5,265,265,'2026-09-18 18:41:52.099928');
INSERT INTO "inventario" VALUES(42,1,4,'42','Negro Clásico',20,0,20,5,270,270,'2026-09-18 18:41:52.099930');
INSERT INTO "inventario" VALUES(43,1,4,'42','Marrón Suizo',20,0,20,5,270,270,'2026-09-18 18:41:52.099932');
INSERT INTO "inventario" VALUES(44,1,4,'42','Cognac',20,0,20,5,270,270,'2026-09-18 18:41:52.099934');
INSERT INTO "inventario" VALUES(45,1,5,'38','Azul Noche',19,0,19,5,386.4,386.4,'2026-09-21 22:48:23.728424');
INSERT INTO "inventario" VALUES(46,1,5,'38','Gris Marengo',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.099938');
INSERT INTO "inventario" VALUES(47,1,5,'40','Azul Noche',20,0,20,5,420,420,'2026-09-18 18:41:52.099939');
INSERT INTO "inventario" VALUES(48,1,5,'40','Gris Marengo',20,0,20,5,420,420,'2026-09-18 18:41:52.099941');
INSERT INTO "inventario" VALUES(49,1,5,'42','Azul Noche',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.099943');
INSERT INTO "inventario" VALUES(50,1,5,'42','Gris Marengo',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.099945');
INSERT INTO "inventario" VALUES(51,1,5,'44','Azul Noche',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.099947');
INSERT INTO "inventario" VALUES(52,1,5,'44','Gris Marengo',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.099949');
INSERT INTO "inventario" VALUES(53,1,6,'39','Azul Marino',17,0,17,5,197.4,197.4,'2026-09-21 21:56:19.058533');
INSERT INTO "inventario" VALUES(54,1,6,'39','Tabaco',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.099954');
INSERT INTO "inventario" VALUES(55,1,6,'40','Azul Marino',20,0,20,5,210,210,'2026-09-18 18:41:52.099955');
INSERT INTO "inventario" VALUES(56,1,6,'40','Tabaco',20,0,20,5,210,210,'2026-09-18 18:41:52.099957');
INSERT INTO "inventario" VALUES(57,1,6,'41','Azul Marino',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.099959');
INSERT INTO "inventario" VALUES(58,1,6,'41','Tabaco',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.099961');
INSERT INTO "inventario" VALUES(59,1,6,'42','Azul Marino',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.099963');
INSERT INTO "inventario" VALUES(60,1,6,'42','Tabaco',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.099965');
INSERT INTO "inventario" VALUES(61,1,7,'S','Blanco Puro',14,0,14,5,112.5,112.5,'2026-09-22 00:54:04.166776');
INSERT INTO "inventario" VALUES(62,1,7,'S','Verde Salvia',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.099969');
INSERT INTO "inventario" VALUES(63,1,7,'S','Celeste Pastel',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.099971');
INSERT INTO "inventario" VALUES(64,1,7,'M','Blanco Puro',20,0,20,5,125,125,'2026-09-18 18:41:52.099973');
INSERT INTO "inventario" VALUES(65,1,7,'M','Verde Salvia',20,0,20,5,125,125,'2026-09-18 18:41:52.099975');
INSERT INTO "inventario" VALUES(66,1,7,'M','Celeste Pastel',20,0,20,5,125,125,'2026-09-18 18:41:52.099977');
INSERT INTO "inventario" VALUES(67,1,7,'L','Blanco Puro',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.099979');
INSERT INTO "inventario" VALUES(68,1,7,'L','Verde Salvia',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.099980');
INSERT INTO "inventario" VALUES(69,1,7,'L','Celeste Pastel',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.099982');
INSERT INTO "inventario" VALUES(70,1,7,'XL','Blanco Puro',19,0,19,5,150,150,'2026-09-22 00:37:53.966565');
INSERT INTO "inventario" VALUES(71,1,7,'XL','Verde Salvia',20,0,20,5,150,150,'2026-09-18 18:41:52.099986');
INSERT INTO "inventario" VALUES(72,1,7,'XL','Celeste Pastel',20,0,20,5,150,150,'2026-09-18 18:41:52.099988');
INSERT INTO "inventario" VALUES(73,2,1,'S','Azul Marino',20,0,20,5,99,99,'2026-09-18 18:41:52.099990');
INSERT INTO "inventario" VALUES(74,2,1,'S','Blanco Óptico',20,0,20,5,99,99,'2026-09-18 18:41:52.099992');
INSERT INTO "inventario" VALUES(75,2,1,'S','Celeste Cielo',20,0,20,5,99,99,'2026-09-18 18:41:52.099994');
INSERT INTO "inventario" VALUES(76,2,1,'M','Azul Marino',20,0,20,5,110,110,'2026-09-18 18:41:52.099996');
INSERT INTO "inventario" VALUES(77,2,1,'M','Blanco Óptico',20,0,20,5,110,110,'2026-09-18 18:41:52.099998');
INSERT INTO "inventario" VALUES(78,2,1,'M','Celeste Cielo',20,0,20,5,110,110,'2026-09-18 18:41:52.099999');
INSERT INTO "inventario" VALUES(79,2,1,'L','Azul Marino',20,0,20,5,121,121,'2026-09-18 18:41:52.100001');
INSERT INTO "inventario" VALUES(80,2,1,'L','Blanco Óptico',20,0,20,5,121,121,'2026-09-18 18:41:52.100003');
INSERT INTO "inventario" VALUES(81,2,1,'L','Celeste Cielo',20,0,20,5,121,121,'2026-09-18 18:41:52.100005');
INSERT INTO "inventario" VALUES(82,2,1,'XL','Azul Marino',20,0,20,5,132,132,'2026-09-18 18:41:52.100007');
INSERT INTO "inventario" VALUES(83,2,1,'XL','Blanco Óptico',20,0,20,5,132,132,'2026-09-18 18:41:52.100009');
INSERT INTO "inventario" VALUES(84,2,1,'XL','Celeste Cielo',20,0,20,5,132,132,'2026-09-18 18:41:52.100011');
INSERT INTO "inventario" VALUES(85,2,2,'30','Beige Arena',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100013');
INSERT INTO "inventario" VALUES(86,2,2,'30','Azul Noche',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100015');
INSERT INTO "inventario" VALUES(87,2,2,'30','Verde Oliva',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100016');
INSERT INTO "inventario" VALUES(88,2,2,'32','Beige Arena',20,0,20,5,130,130,'2026-09-18 18:41:52.100018');
INSERT INTO "inventario" VALUES(89,2,2,'32','Azul Noche',20,0,20,5,130,130,'2026-09-18 18:41:52.100020');
INSERT INTO "inventario" VALUES(90,2,2,'32','Verde Oliva',20,0,20,5,130,130,'2026-09-18 18:41:52.100022');
INSERT INTO "inventario" VALUES(91,2,2,'34','Beige Arena',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100032');
INSERT INTO "inventario" VALUES(92,2,2,'34','Azul Noche',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100033');
INSERT INTO "inventario" VALUES(93,2,2,'34','Verde Oliva',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100035');
INSERT INTO "inventario" VALUES(94,2,2,'36','Beige Arena',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100036');
INSERT INTO "inventario" VALUES(95,2,2,'36','Azul Noche',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100037');
INSERT INTO "inventario" VALUES(96,2,2,'36','Verde Oliva',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100038');
INSERT INTO "inventario" VALUES(97,2,3,'38','Azul Cobalto',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100039');
INSERT INTO "inventario" VALUES(98,2,3,'38','Gris Plomo',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100041');
INSERT INTO "inventario" VALUES(99,2,3,'40','Azul Cobalto',20,0,20,5,280,280,'2026-09-18 18:41:52.100042');
INSERT INTO "inventario" VALUES(100,2,3,'40','Gris Plomo',20,0,20,5,280,280,'2026-09-18 18:41:52.100043');
INSERT INTO "inventario" VALUES(101,2,3,'42','Azul Cobalto',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100044');
INSERT INTO "inventario" VALUES(102,2,3,'42','Gris Plomo',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100046');
INSERT INTO "inventario" VALUES(103,2,4,'39','Negro Clásico',20,0,20,5,235,235,'2026-09-18 18:41:52.100047');
INSERT INTO "inventario" VALUES(104,2,4,'39','Marrón Suizo',20,0,20,5,235,235,'2026-09-18 18:41:52.100048');
INSERT INTO "inventario" VALUES(105,2,4,'39','Cognac',20,0,20,5,235,235,'2026-09-18 18:41:52.100049');
INSERT INTO "inventario" VALUES(106,2,4,'40','Negro Clásico',20,0,20,5,250,250,'2026-09-18 18:41:52.100050');
INSERT INTO "inventario" VALUES(107,2,4,'40','Marrón Suizo',20,0,20,5,250,250,'2026-09-18 18:41:52.100051');
INSERT INTO "inventario" VALUES(108,2,4,'40','Cognac',20,0,20,5,250,250,'2026-09-18 18:41:52.100053');
INSERT INTO "inventario" VALUES(109,2,4,'41','Negro Clásico',20,0,20,5,265,265,'2026-09-18 18:41:52.100054');
INSERT INTO "inventario" VALUES(110,2,4,'41','Marrón Suizo',20,0,20,5,265,265,'2026-09-18 18:41:52.100055');
INSERT INTO "inventario" VALUES(111,2,4,'41','Cognac',20,0,20,5,265,265,'2026-09-18 18:41:52.100056');
INSERT INTO "inventario" VALUES(112,2,4,'42','Negro Clásico',20,0,20,5,270,270,'2026-09-18 18:41:52.100057');
INSERT INTO "inventario" VALUES(113,2,4,'42','Marrón Suizo',20,0,20,5,270,270,'2026-09-18 18:41:52.100059');
INSERT INTO "inventario" VALUES(114,2,4,'42','Cognac',20,0,20,5,270,270,'2026-09-18 18:41:52.100060');
INSERT INTO "inventario" VALUES(115,2,5,'38','Azul Noche',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100061');
INSERT INTO "inventario" VALUES(116,2,5,'38','Gris Marengo',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100062');
INSERT INTO "inventario" VALUES(117,2,5,'40','Azul Noche',20,0,20,5,420,420,'2026-09-18 18:41:52.100063');
INSERT INTO "inventario" VALUES(118,2,5,'40','Gris Marengo',20,0,20,5,420,420,'2026-09-18 18:41:52.100065');
INSERT INTO "inventario" VALUES(119,2,5,'42','Azul Noche',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100066');
INSERT INTO "inventario" VALUES(120,2,5,'42','Gris Marengo',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100067');
INSERT INTO "inventario" VALUES(121,2,5,'44','Azul Noche',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100068');
INSERT INTO "inventario" VALUES(122,2,5,'44','Gris Marengo',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100070');
INSERT INTO "inventario" VALUES(123,2,6,'39','Azul Marino',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100071');
INSERT INTO "inventario" VALUES(124,2,6,'39','Tabaco',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100072');
INSERT INTO "inventario" VALUES(125,2,6,'40','Azul Marino',20,0,20,5,210,210,'2026-09-18 18:41:52.100073');
INSERT INTO "inventario" VALUES(126,2,6,'40','Tabaco',20,0,20,5,210,210,'2026-09-18 18:41:52.100074');
INSERT INTO "inventario" VALUES(127,2,6,'41','Azul Marino',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100075');
INSERT INTO "inventario" VALUES(128,2,6,'41','Tabaco',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100076');
INSERT INTO "inventario" VALUES(129,2,6,'42','Azul Marino',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100078');
INSERT INTO "inventario" VALUES(130,2,6,'42','Tabaco',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100079');
INSERT INTO "inventario" VALUES(131,2,7,'S','Blanco Puro',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100080');
INSERT INTO "inventario" VALUES(132,2,7,'S','Verde Salvia',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100081');
INSERT INTO "inventario" VALUES(133,2,7,'S','Celeste Pastel',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100082');
INSERT INTO "inventario" VALUES(134,2,7,'M','Blanco Puro',20,0,20,5,125,125,'2026-09-18 18:41:52.100083');
INSERT INTO "inventario" VALUES(135,2,7,'M','Verde Salvia',20,0,20,5,125,125,'2026-09-18 18:41:52.100085');
INSERT INTO "inventario" VALUES(136,2,7,'M','Celeste Pastel',20,0,20,5,125,125,'2026-09-18 18:41:52.100086');
INSERT INTO "inventario" VALUES(137,2,7,'L','Blanco Puro',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100087');
INSERT INTO "inventario" VALUES(138,2,7,'L','Verde Salvia',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100088');
INSERT INTO "inventario" VALUES(139,2,7,'L','Celeste Pastel',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100089');
INSERT INTO "inventario" VALUES(140,2,7,'XL','Blanco Puro',20,0,20,5,150,150,'2026-09-18 18:41:52.100090');
INSERT INTO "inventario" VALUES(141,2,7,'XL','Verde Salvia',20,0,20,5,150,150,'2026-09-18 18:41:52.100092');
INSERT INTO "inventario" VALUES(142,2,7,'XL','Celeste Pastel',20,0,20,5,150,150,'2026-09-18 18:41:52.100093');
INSERT INTO "inventario" VALUES(143,3,1,'S','Azul Marino',20,0,20,5,99,99,'2026-09-18 18:41:52.100094');
INSERT INTO "inventario" VALUES(144,3,1,'S','Blanco Óptico',20,0,20,5,99,99,'2026-09-18 18:41:52.100095');
INSERT INTO "inventario" VALUES(145,3,1,'S','Celeste Cielo',20,0,20,5,99,99,'2026-09-18 18:41:52.100096');
INSERT INTO "inventario" VALUES(146,3,1,'M','Blanco Óptico',20,0,20,5,110,110,'2026-09-18 18:41:52.100097');
INSERT INTO "inventario" VALUES(147,3,1,'M','Celeste Cielo',20,0,20,5,110,110,'2026-09-18 18:41:52.100098');
INSERT INTO "inventario" VALUES(148,3,1,'L','Azul Marino',20,0,20,5,121,121,'2026-09-18 18:41:52.100100');
INSERT INTO "inventario" VALUES(149,3,1,'L','Blanco Óptico',20,0,20,5,121,121,'2026-09-18 18:41:52.100101');
INSERT INTO "inventario" VALUES(150,3,1,'L','Celeste Cielo',20,0,20,5,121,121,'2026-09-18 18:41:52.100102');
INSERT INTO "inventario" VALUES(151,3,1,'XL','Azul Marino',20,0,20,5,132,132,'2026-09-18 18:41:52.100103');
INSERT INTO "inventario" VALUES(152,3,1,'XL','Blanco Óptico',20,0,20,5,132,132,'2026-09-18 18:41:52.100104');
INSERT INTO "inventario" VALUES(153,3,1,'XL','Celeste Cielo',20,0,20,5,132,132,'2026-09-18 18:41:52.100106');
INSERT INTO "inventario" VALUES(154,3,2,'30','Beige Arena',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100107');
INSERT INTO "inventario" VALUES(155,3,2,'30','Azul Noche',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100108');
INSERT INTO "inventario" VALUES(156,3,2,'30','Verde Oliva',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100109');
INSERT INTO "inventario" VALUES(157,3,2,'32','Beige Arena',20,0,20,5,130,130,'2026-09-18 18:41:52.100110');
INSERT INTO "inventario" VALUES(158,3,2,'32','Azul Noche',20,0,20,5,130,130,'2026-09-18 18:41:52.100111');
INSERT INTO "inventario" VALUES(159,3,2,'32','Verde Oliva',20,0,20,5,130,130,'2026-09-18 18:41:52.100113');
INSERT INTO "inventario" VALUES(160,3,2,'34','Beige Arena',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100114');
INSERT INTO "inventario" VALUES(161,3,2,'34','Azul Noche',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100115');
INSERT INTO "inventario" VALUES(162,3,2,'34','Verde Oliva',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100116');
INSERT INTO "inventario" VALUES(163,3,2,'36','Beige Arena',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100117');
INSERT INTO "inventario" VALUES(164,3,2,'36','Azul Noche',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100118');
INSERT INTO "inventario" VALUES(165,3,2,'36','Verde Oliva',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100119');
INSERT INTO "inventario" VALUES(166,3,3,'38','Azul Cobalto',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100121');
INSERT INTO "inventario" VALUES(167,3,3,'38','Gris Plomo',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100122');
INSERT INTO "inventario" VALUES(168,3,3,'40','Azul Cobalto',20,0,20,5,280,280,'2026-09-18 18:41:52.100123');
INSERT INTO "inventario" VALUES(169,3,3,'40','Gris Plomo',20,0,20,5,280,280,'2026-09-18 18:41:52.100124');
INSERT INTO "inventario" VALUES(170,3,3,'42','Azul Cobalto',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100126');
INSERT INTO "inventario" VALUES(171,3,3,'42','Gris Plomo',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100127');
INSERT INTO "inventario" VALUES(172,3,4,'39','Negro Clásico',20,0,20,5,235,235,'2026-09-18 18:41:52.100128');
INSERT INTO "inventario" VALUES(173,3,4,'39','Marrón Suizo',20,0,20,5,235,235,'2026-09-18 18:41:52.100129');
INSERT INTO "inventario" VALUES(174,3,4,'39','Cognac',20,0,20,5,235,235,'2026-09-18 18:41:52.100130');
INSERT INTO "inventario" VALUES(175,3,4,'40','Negro Clásico',20,0,20,5,250,250,'2026-09-18 18:41:52.100131');
INSERT INTO "inventario" VALUES(176,3,4,'40','Marrón Suizo',20,0,20,5,250,250,'2026-09-18 18:41:52.100135');
INSERT INTO "inventario" VALUES(177,3,4,'40','Cognac',20,0,20,5,250,250,'2026-09-18 18:41:52.100136');
INSERT INTO "inventario" VALUES(178,3,4,'41','Negro Clásico',20,0,20,5,265,265,'2026-09-18 18:41:52.100138');
INSERT INTO "inventario" VALUES(179,3,4,'41','Marrón Suizo',20,0,20,5,265,265,'2026-09-18 18:41:52.100139');
INSERT INTO "inventario" VALUES(180,3,4,'41','Cognac',20,0,20,5,265,265,'2026-09-18 18:41:52.100140');
INSERT INTO "inventario" VALUES(181,3,4,'42','Negro Clásico',20,0,20,5,270,270,'2026-09-18 18:41:52.100141');
INSERT INTO "inventario" VALUES(182,3,4,'42','Marrón Suizo',20,0,20,5,270,270,'2026-09-18 18:41:52.100142');
INSERT INTO "inventario" VALUES(183,3,4,'42','Cognac',20,0,20,5,270,270,'2026-09-18 18:41:52.100143');
INSERT INTO "inventario" VALUES(184,3,5,'38','Azul Noche',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100145');
INSERT INTO "inventario" VALUES(185,3,5,'38','Gris Marengo',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100146');
INSERT INTO "inventario" VALUES(186,3,5,'40','Azul Noche',20,0,20,5,420,420,'2026-09-18 18:41:52.100147');
INSERT INTO "inventario" VALUES(187,3,5,'40','Gris Marengo',20,0,20,5,420,420,'2026-09-18 18:41:52.100148');
INSERT INTO "inventario" VALUES(188,3,5,'42','Azul Noche',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100149');
INSERT INTO "inventario" VALUES(189,3,5,'42','Gris Marengo',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100150');
INSERT INTO "inventario" VALUES(190,3,5,'44','Azul Noche',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100152');
INSERT INTO "inventario" VALUES(191,3,5,'44','Gris Marengo',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100153');
INSERT INTO "inventario" VALUES(192,3,6,'39','Azul Marino',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100154');
INSERT INTO "inventario" VALUES(193,3,6,'39','Tabaco',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100155');
INSERT INTO "inventario" VALUES(194,3,6,'40','Azul Marino',20,0,20,5,210,210,'2026-09-18 18:41:52.100156');
INSERT INTO "inventario" VALUES(195,3,6,'40','Tabaco',20,0,20,5,210,210,'2026-09-18 18:41:52.100157');
INSERT INTO "inventario" VALUES(196,3,6,'41','Azul Marino',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100159');
INSERT INTO "inventario" VALUES(197,3,6,'41','Tabaco',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100160');
INSERT INTO "inventario" VALUES(198,3,6,'42','Azul Marino',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100161');
INSERT INTO "inventario" VALUES(199,3,6,'42','Tabaco',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100162');
INSERT INTO "inventario" VALUES(200,3,7,'S','Blanco Puro',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100164');
INSERT INTO "inventario" VALUES(201,3,7,'S','Verde Salvia',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100165');
INSERT INTO "inventario" VALUES(202,3,7,'S','Celeste Pastel',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100166');
INSERT INTO "inventario" VALUES(203,3,7,'M','Blanco Puro',20,0,20,5,125,125,'2026-09-18 18:41:52.100167');
INSERT INTO "inventario" VALUES(204,3,7,'M','Verde Salvia',20,0,20,5,125,125,'2026-09-18 18:41:52.100168');
INSERT INTO "inventario" VALUES(205,3,7,'M','Celeste Pastel',20,0,20,5,125,125,'2026-09-18 18:41:52.100169');
INSERT INTO "inventario" VALUES(206,3,7,'L','Blanco Puro',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100170');
INSERT INTO "inventario" VALUES(207,3,7,'L','Verde Salvia',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100172');
INSERT INTO "inventario" VALUES(208,3,7,'L','Celeste Pastel',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100173');
INSERT INTO "inventario" VALUES(209,3,7,'XL','Blanco Puro',20,0,20,5,150,150,'2026-09-18 18:41:52.100174');
INSERT INTO "inventario" VALUES(210,3,7,'XL','Verde Salvia',20,0,20,5,150,150,'2026-09-18 18:41:52.100175');
INSERT INTO "inventario" VALUES(211,3,7,'XL','Celeste Pastel',20,0,20,5,150,150,'2026-09-18 18:41:52.100176');
INSERT INTO "inventario" VALUES(212,4,1,'S','Azul Marino',20,0,20,5,99,99,'2026-09-18 18:41:52.100178');
INSERT INTO "inventario" VALUES(213,4,1,'S','Blanco Óptico',20,0,20,5,99,99,'2026-09-18 18:41:52.100179');
INSERT INTO "inventario" VALUES(214,4,1,'S','Celeste Cielo',20,0,20,5,99,99,'2026-09-18 18:41:52.100180');
INSERT INTO "inventario" VALUES(215,4,1,'M','Azul Marino',20,0,20,5,110,110,'2026-09-18 18:41:52.100181');
INSERT INTO "inventario" VALUES(216,4,1,'M','Blanco Óptico',20,0,20,5,110,110,'2026-09-18 18:41:52.100182');
INSERT INTO "inventario" VALUES(217,4,1,'M','Celeste Cielo',20,0,20,5,110,110,'2026-09-18 18:41:52.100183');
INSERT INTO "inventario" VALUES(218,4,1,'L','Azul Marino',20,0,20,5,121,121,'2026-09-18 18:41:52.100185');
INSERT INTO "inventario" VALUES(219,4,1,'L','Blanco Óptico',20,0,20,5,121,121,'2026-09-18 18:41:52.100186');
INSERT INTO "inventario" VALUES(220,4,1,'L','Celeste Cielo',20,0,20,5,121,121,'2026-09-18 18:41:52.100187');
INSERT INTO "inventario" VALUES(221,4,1,'XL','Azul Marino',20,0,20,5,132,132,'2026-09-18 18:41:52.100188');
INSERT INTO "inventario" VALUES(222,4,1,'XL','Blanco Óptico',20,0,20,5,132,132,'2026-09-18 18:41:52.100189');
INSERT INTO "inventario" VALUES(223,4,1,'XL','Celeste Cielo',20,0,20,5,132,132,'2026-09-18 18:41:52.100190');
INSERT INTO "inventario" VALUES(224,4,2,'30','Beige Arena',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100191');
INSERT INTO "inventario" VALUES(225,4,2,'30','Azul Noche',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100193');
INSERT INTO "inventario" VALUES(226,4,2,'30','Verde Oliva',20,0,20,5,119.6,119.6,'2026-09-18 18:41:52.100194');
INSERT INTO "inventario" VALUES(227,4,2,'32','Beige Arena',20,0,20,5,130,130,'2026-09-18 18:41:52.100195');
INSERT INTO "inventario" VALUES(228,4,2,'32','Azul Noche',20,0,20,5,130,130,'2026-09-18 18:41:52.100196');
INSERT INTO "inventario" VALUES(229,4,2,'32','Verde Oliva',20,0,20,5,130,130,'2026-09-18 18:41:52.100197');
INSERT INTO "inventario" VALUES(230,4,2,'34','Beige Arena',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100198');
INSERT INTO "inventario" VALUES(231,4,2,'34','Azul Noche',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100200');
INSERT INTO "inventario" VALUES(232,4,2,'34','Verde Oliva',20,0,20,5,140.4,140.4,'2026-09-18 18:41:52.100201');
INSERT INTO "inventario" VALUES(233,4,2,'36','Beige Arena',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100202');
INSERT INTO "inventario" VALUES(234,4,2,'36','Azul Noche',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100203');
INSERT INTO "inventario" VALUES(235,4,2,'36','Verde Oliva',20,0,20,5,153.4,153.4,'2026-09-18 18:41:52.100204');
INSERT INTO "inventario" VALUES(236,4,3,'38','Azul Cobalto',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100205');
INSERT INTO "inventario" VALUES(237,4,3,'38','Gris Plomo',20,0,20,5,257.6,257.6,'2026-09-18 18:41:52.100206');
INSERT INTO "inventario" VALUES(238,4,3,'40','Azul Cobalto',20,0,20,5,280,280,'2026-09-18 18:41:52.100208');
INSERT INTO "inventario" VALUES(239,4,3,'42','Azul Cobalto',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100209');
INSERT INTO "inventario" VALUES(240,4,3,'42','Gris Plomo',20,0,20,5,302.4,302.4,'2026-09-18 18:41:52.100210');
INSERT INTO "inventario" VALUES(241,4,4,'39','Negro Clásico',20,0,20,5,235,235,'2026-09-18 18:41:52.100211');
INSERT INTO "inventario" VALUES(242,4,4,'39','Marrón Suizo',20,0,20,5,235,235,'2026-09-18 18:41:52.100212');
INSERT INTO "inventario" VALUES(243,4,4,'39','Cognac',20,0,20,5,235,235,'2026-09-18 18:41:52.100214');
INSERT INTO "inventario" VALUES(244,4,4,'40','Negro Clásico',20,0,20,5,250,250,'2026-09-18 18:41:52.100215');
INSERT INTO "inventario" VALUES(245,4,4,'40','Marrón Suizo',20,0,20,5,250,250,'2026-09-18 18:41:52.100216');
INSERT INTO "inventario" VALUES(246,4,4,'40','Cognac',20,0,20,5,250,250,'2026-09-18 18:41:52.100217');
INSERT INTO "inventario" VALUES(247,4,4,'41','Negro Clásico',20,0,20,5,265,265,'2026-09-18 18:41:52.100218');
INSERT INTO "inventario" VALUES(248,4,4,'41','Marrón Suizo',20,0,20,5,265,265,'2026-09-18 18:41:52.100219');
INSERT INTO "inventario" VALUES(249,4,4,'41','Cognac',20,0,20,5,265,265,'2026-09-18 18:41:52.100221');
INSERT INTO "inventario" VALUES(250,4,4,'42','Negro Clásico',20,0,20,5,270,270,'2026-09-18 18:41:52.100222');
INSERT INTO "inventario" VALUES(251,4,4,'42','Marrón Suizo',20,0,20,5,270,270,'2026-09-18 18:41:52.100223');
INSERT INTO "inventario" VALUES(252,4,4,'42','Cognac',20,0,20,5,270,270,'2026-09-18 18:41:52.100224');
INSERT INTO "inventario" VALUES(253,4,5,'38','Azul Noche',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100225');
INSERT INTO "inventario" VALUES(254,4,5,'38','Gris Marengo',20,0,20,5,386.4,386.4,'2026-09-18 18:41:52.100226');
INSERT INTO "inventario" VALUES(255,4,5,'40','Azul Noche',20,0,20,5,420,420,'2026-09-18 18:41:52.100228');
INSERT INTO "inventario" VALUES(256,4,5,'40','Gris Marengo',20,0,20,5,420,420,'2026-09-18 18:41:52.100229');
INSERT INTO "inventario" VALUES(257,4,5,'42','Azul Noche',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100230');
INSERT INTO "inventario" VALUES(258,4,5,'42','Gris Marengo',20,0,20,5,453.6,453.6,'2026-09-18 18:41:52.100231');
INSERT INTO "inventario" VALUES(259,4,5,'44','Azul Noche',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100232');
INSERT INTO "inventario" VALUES(260,4,5,'44','Gris Marengo',20,0,20,5,495.6,495.6,'2026-09-18 18:41:52.100233');
INSERT INTO "inventario" VALUES(261,4,6,'39','Azul Marino',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100235');
INSERT INTO "inventario" VALUES(262,4,6,'39','Tabaco',20,0,20,5,197.4,197.4,'2026-09-18 18:41:52.100258');
INSERT INTO "inventario" VALUES(263,4,6,'40','Azul Marino',20,0,20,5,210,210,'2026-09-18 18:41:52.100259');
INSERT INTO "inventario" VALUES(264,4,6,'40','Tabaco',20,0,20,5,210,210,'2026-09-18 18:41:52.100260');
INSERT INTO "inventario" VALUES(265,4,6,'41','Azul Marino',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100261');
INSERT INTO "inventario" VALUES(266,4,6,'41','Tabaco',20,0,20,5,222.6,222.6,'2026-09-18 18:41:52.100263');
INSERT INTO "inventario" VALUES(267,4,6,'42','Azul Marino',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100264');
INSERT INTO "inventario" VALUES(268,4,6,'42','Tabaco',20,0,20,5,226.8,226.8,'2026-09-18 18:41:52.100265');
INSERT INTO "inventario" VALUES(269,4,7,'S','Blanco Puro',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100267');
INSERT INTO "inventario" VALUES(270,4,7,'S','Verde Salvia',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100268');
INSERT INTO "inventario" VALUES(271,4,7,'S','Celeste Pastel',20,0,20,5,112.5,112.5,'2026-09-18 18:41:52.100269');
INSERT INTO "inventario" VALUES(272,4,7,'M','Blanco Puro',20,0,20,5,125,125,'2026-09-18 18:41:52.100270');
INSERT INTO "inventario" VALUES(273,4,7,'M','Verde Salvia',20,0,20,5,125,125,'2026-09-18 18:41:52.100271');
INSERT INTO "inventario" VALUES(274,4,7,'M','Celeste Pastel',20,0,20,5,125,125,'2026-09-18 18:41:52.100272');
INSERT INTO "inventario" VALUES(275,4,7,'L','Blanco Puro',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100274');
INSERT INTO "inventario" VALUES(276,4,7,'L','Verde Salvia',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100275');
INSERT INTO "inventario" VALUES(277,4,7,'L','Celeste Pastel',20,0,20,5,137.5,137.5,'2026-09-18 18:41:52.100276');
INSERT INTO "inventario" VALUES(278,4,7,'XL','Blanco Puro',20,0,20,5,150,150,'2026-09-18 18:41:52.100277');
INSERT INTO "inventario" VALUES(279,4,7,'XL','Verde Salvia',20,0,20,5,150,150,'2026-09-18 18:41:52.100278');
INSERT INTO "inventario" VALUES(280,4,7,'XL','Celeste Pastel',20,0,20,5,150,150,'2026-09-18 18:41:52.100280');
INSERT INTO "inventario" VALUES(281,1,1,'S','Blanco Puro',20,0,20,3,110,110,'2026-09-21 14:25:43.035891');
INSERT INTO "inventario" VALUES(282,1,1,'L','Azul Noche',20,0,20,2,95,95,'2026-09-21 14:25:43.088721');
INSERT INTO "inventario" VALUES(283,1,1,'M','Negro',20,0,20,5,126,126,'2026-09-21 14:25:42.944637');
CREATE TABLE kardex_movimientos (
	id_movimiento INTEGER NOT NULL, 
	id_inventario INTEGER NOT NULL, 
	tipo_movimiento VARCHAR(30) NOT NULL, 
	cantidad INTEGER NOT NULL, 
	costo_unitario_movimiento NUMERIC(10, 2) NOT NULL, 
	saldo_cantidad_resultante INTEGER NOT NULL, 
	saldo_cpp_resultante NUMERIC(10, 2) NOT NULL, 
	referencia_documento VARCHAR(100), 
	fecha_hora DATETIME, 
	PRIMARY KEY (id_movimiento), 
	FOREIGN KEY(id_inventario) REFERENCES inventario (id_inventario) ON DELETE CASCADE
);
INSERT INTO "kardex_movimientos" VALUES(1,1,'ENTRADA_COMPRA',15,90,15,90,'Ingreso Lote Inicial Fac-101 - Confecciones Andina SA','2026-09-15 09:00:00');
INSERT INTO "kardex_movimientos" VALUES(2,1,'ENTRADA_COMPRA',20,120,35,107.14,'Ingreso Segundo Lote Fac-205 - Recálculo Formal CPP','2026-09-15 14:30:00');
INSERT INTO "kardex_movimientos" VALUES(3,1,'ENTRADA_COMPRA',10,107.14,45,107.14,'Ingreso Lote de Reposición Fac-309 - Confecciones Andina SA','2026-09-16 08:30:00');
INSERT INTO "kardex_movimientos" VALUES(4,1,'SALIDA_VENTA',1,107.14,44,107.14,'Factura Mostrador POS-2026-0042','2026-09-16 11:30:00');
INSERT INTO "kardex_movimientos" VALUES(5,1,'SALIDA_VENTA',1,107.14,43,107.14,'Factura Mostrador POS-2026-0055','2026-09-17 15:45:00');
INSERT INTO "kardex_movimientos" VALUES(6,1,'SALIDA_VENTA',1,107.14,42,107.14,'Venta Digital Web FAC-2026-0081','2026-09-18 10:20:00');
INSERT INTO "kardex_movimientos" VALUES(7,1,'SALIDA_VENTA',1,107.14,41,107.14,'Factura Mostrador POS-2026-0099','2026-09-18 16:10:00');
INSERT INTO "kardex_movimientos" VALUES(8,1,'DEVOLUCION_VENTA',1,107.14,42,107.14,'Devolución DEV-2026-0012 Reembolso (Ticket POS-2026-0042)','2026-09-20 11:15:00');
INSERT INTO "kardex_movimientos" VALUES(9,1,'DEVOLUCION_VENTA',1,107.14,43,107.14,'Devolución DEV-2026-0025 Vale Crédito (Ticket POS-2026-0055)','2026-09-20 16:30:00');
INSERT INTO "kardex_movimientos" VALUES(10,1,'DEVOLUCION_VENTA',1,107.14,44,107.14,'Devolución DEV-2026-0038 Cambio Prenda (Ticket POS-2026-0099)','2026-09-21 10:45:00');
INSERT INTO "kardex_movimientos" VALUES(11,1,'RESERVA_APARTADA',1,107.14,44,107.14,'Reserva Probador Apartada Ticket #RES-2026-EQUI-101','2026-09-21 11:00:00');
INSERT INTO "kardex_movimientos" VALUES(12,1,'RESERVA_APARTADA',1,107.14,44,107.14,'Reserva Probador Apartada Ticket #RES-2026-EQUI-102','2026-09-21 11:05:00');
INSERT INTO "kardex_movimientos" VALUES(13,1,'RESERVA_APARTADA',1,107.14,44,107.14,'Reserva Probador Apartada Ticket #RES-2026-EQUI-103','2026-09-21 11:10:00');
INSERT INTO "kardex_movimientos" VALUES(14,1,'RESERVA_APARTADA',1,107.14,44,107.14,'Reserva Probador Apartada Ticket #RES-2026-EQUI-104','2026-09-21 11:15:00');
INSERT INTO "kardex_movimientos" VALUES(15,1,'RESERVA_APARTADA',1,107.14,44,107.14,'Reserva Probador Apartada Ticket #RES-2026-EQUI-105','2026-09-21 11:20:00');
INSERT INTO "kardex_movimientos" VALUES(16,2,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1012 - Confecciones Andina SA','2026-09-15 09:30:00');
INSERT INTO "kardex_movimientos" VALUES(17,2,'SALIDA_VENTA',1,110,19,110,'Entrega por Cambio Prenda Comprobante DEV-2026-0038','2026-09-21 10:45:00');
INSERT INTO "kardex_movimientos" VALUES(18,3,'ENTRADA_COMPRA',20,135,20,135,'Ingreso Lote Inicial Fac-1013 - Hilanderías del Sur SRL','2026-09-15 10:00:00');
INSERT INTO "kardex_movimientos" VALUES(19,3,'RESERVA_APARTADA',1,135,20,135,'Reserva Probador Apartada Ticket #RES-2026-EQUI-201','2026-09-21 09:15:00');
INSERT INTO "kardex_movimientos" VALUES(20,3,'RESERVA_APARTADA',1,135,20,135,'Reserva Probador Apartada Ticket #RES-2026-EQUI-202','2026-09-21 09:30:00');
INSERT INTO "kardex_movimientos" VALUES(21,4,'ENTRADA_COMPRA',15,115,15,115,'Ingreso Lote Traslado Sucursal Calacoto Fac-1014 - Confecciones Andina SA','2026-09-15 10:30:00');
INSERT INTO "kardex_movimientos" VALUES(22,5,'ENTRADA_COMPRA',10,310,10,310,'Ingreso Lote Importación Fac-1015 - Importadora Textil Italiana','2026-09-15 11:00:00');
INSERT INTO "kardex_movimientos" VALUES(23,5,'SALIDA_VENTA',2,310,8,310,'Factura Mostrador POS-2026-0077','2026-09-19 14:00:00');
INSERT INTO "kardex_movimientos" VALUES(24,5,'RESERVA_APARTADA',1,310,8,310,'Reserva Probador Apartada Ticket #RES-2026-PRADO-501','2026-09-21 08:45:00');
INSERT INTO "kardex_movimientos" VALUES(25,6,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1006 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(26,7,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1007 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(27,8,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1008 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(28,9,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1009 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(29,10,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1010 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(30,11,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1011 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(31,12,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1012 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(32,13,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1013 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(33,14,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1014 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(34,15,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1015 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(35,16,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1016 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(36,17,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1017 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(37,18,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1018 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(38,19,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1019 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(39,20,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1020 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(40,21,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1021 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(41,22,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1022 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(42,23,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1023 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(43,24,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1024 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(44,25,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1025 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(45,26,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1026 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(46,27,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1027 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(47,28,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1028 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(48,29,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1029 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(49,30,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1030 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(50,31,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1031 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(51,32,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1032 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(52,33,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1033 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(53,34,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1034 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(54,35,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1035 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(55,36,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1036 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(56,37,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1037 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(57,38,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1038 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(58,39,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1039 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(59,40,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1040 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(60,41,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1041 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(61,42,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1042 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(62,43,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1043 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(63,44,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1044 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(64,45,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1045 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(65,46,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1046 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(66,47,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1047 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(67,48,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1048 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(68,49,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1049 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(69,50,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1050 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(70,51,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1051 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(71,52,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1052 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(72,53,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1053 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(73,54,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1054 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(74,55,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1055 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(75,56,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1056 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(76,57,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1057 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(77,58,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1058 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(78,59,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1059 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(79,60,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1060 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(80,61,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1061 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(81,62,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1062 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(82,63,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1063 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(83,64,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1064 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(84,65,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1065 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(85,66,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1066 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(86,67,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1067 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(87,68,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1068 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(88,69,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1069 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(89,70,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1070 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(90,71,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1071 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(91,72,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1072 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(92,73,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1073 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(93,74,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1074 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(94,75,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1075 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(95,76,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1076 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(96,77,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1077 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(97,78,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1078 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(98,79,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1079 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(99,80,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1080 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(100,81,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1081 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(101,82,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1082 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(102,83,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1083 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(103,84,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1084 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(104,85,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1085 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(105,86,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1086 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(106,87,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1087 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(107,88,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1088 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(108,89,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1089 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(109,90,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1090 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(110,91,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1091 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(111,92,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1092 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(112,93,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1093 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(113,94,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1094 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(114,95,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1095 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(115,96,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1096 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(116,97,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1097 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(117,98,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1098 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(118,99,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1099 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(119,100,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1100 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(120,101,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1101 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(121,102,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1102 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(122,103,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1103 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(123,104,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1104 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(124,105,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1105 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(125,106,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1106 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(126,107,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1107 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(127,108,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1108 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(128,109,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1109 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(129,110,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1110 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(130,111,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1111 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(131,112,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1112 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(132,113,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1113 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(133,114,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1114 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(134,115,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1115 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(135,116,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1116 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(136,117,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1117 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(137,118,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1118 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(138,119,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1119 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(139,120,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1120 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(140,121,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1121 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(141,122,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1122 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(142,123,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1123 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(143,124,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1124 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(144,125,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1125 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(145,126,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1126 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(146,127,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1127 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(147,128,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1128 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(148,129,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1129 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(149,130,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1130 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(150,131,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1131 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(151,132,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1132 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(152,133,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1133 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(153,134,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1134 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(154,135,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1135 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(155,136,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1136 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(156,137,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1137 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(157,138,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1138 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(158,139,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1139 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(159,140,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1140 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(160,141,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1141 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(161,142,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1142 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(162,143,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1143 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(163,144,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1144 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(164,145,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1145 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(165,146,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1146 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(166,147,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1147 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(167,148,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1148 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(168,149,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1149 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(169,150,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1150 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(170,151,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1151 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(171,152,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1152 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(172,153,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1153 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(173,154,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1154 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(174,155,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1155 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(175,156,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1156 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(176,157,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1157 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(177,158,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1158 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(178,159,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1159 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(179,160,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1160 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(180,161,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1161 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(181,162,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1162 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(182,163,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1163 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(183,164,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1164 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(184,165,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1165 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(185,166,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1166 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(186,167,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1167 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(187,168,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1168 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(188,169,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1169 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(189,170,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1170 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(190,171,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1171 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(191,172,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1172 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(192,173,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1173 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(193,174,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1174 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(194,175,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1175 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(195,176,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1176 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(196,177,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1177 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(197,178,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1178 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(198,179,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1179 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(199,180,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1180 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(200,181,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1181 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(201,182,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1182 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(202,183,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1183 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(203,184,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1184 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(204,185,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1185 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(205,186,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1186 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(206,187,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1187 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(207,188,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1188 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(208,189,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1189 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(209,190,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1190 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(210,191,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1191 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(211,192,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1192 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(212,193,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1193 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(213,194,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1194 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(214,195,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1195 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(215,196,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1196 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(216,197,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1197 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(217,198,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1198 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(218,199,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1199 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(219,200,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1200 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(220,201,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1201 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(221,202,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1202 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(222,203,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1203 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(223,204,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1204 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(224,205,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1205 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(225,206,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1206 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(226,207,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1207 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(227,208,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1208 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(228,209,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1209 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(229,210,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1210 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(230,211,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1211 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(231,212,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1212 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(232,213,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1213 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(233,214,'ENTRADA_COMPRA',20,99,20,99,'Ingreso Lote Inicial Fac-1214 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(234,215,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1215 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(235,216,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1216 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(236,217,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1217 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(237,218,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1218 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(238,219,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1219 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(239,220,'ENTRADA_COMPRA',20,121,20,121,'Ingreso Lote Inicial Fac-1220 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(240,221,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1221 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(241,222,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1222 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(242,223,'ENTRADA_COMPRA',20,132,20,132,'Ingreso Lote Inicial Fac-1223 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(243,224,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1224 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(244,225,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1225 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(245,226,'ENTRADA_COMPRA',20,119.6,20,119.6,'Ingreso Lote Inicial Fac-1226 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(246,227,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1227 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(247,228,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1228 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(248,229,'ENTRADA_COMPRA',20,130,20,130,'Ingreso Lote Inicial Fac-1229 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(249,230,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1230 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(250,231,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1231 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(251,232,'ENTRADA_COMPRA',20,140.4,20,140.4,'Ingreso Lote Inicial Fac-1232 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(252,233,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1233 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(253,234,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1234 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(254,235,'ENTRADA_COMPRA',20,153.4,20,153.4,'Ingreso Lote Inicial Fac-1235 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(255,236,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1236 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(256,237,'ENTRADA_COMPRA',20,257.6,20,257.6,'Ingreso Lote Inicial Fac-1237 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(257,238,'ENTRADA_COMPRA',20,280,20,280,'Ingreso Lote Inicial Fac-1238 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(258,239,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1239 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(259,240,'ENTRADA_COMPRA',20,302.4,20,302.4,'Ingreso Lote Inicial Fac-1240 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(260,241,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1241 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(261,242,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1242 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(262,243,'ENTRADA_COMPRA',20,235,20,235,'Ingreso Lote Inicial Fac-1243 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(263,244,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1244 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(264,245,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1245 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(265,246,'ENTRADA_COMPRA',20,250,20,250,'Ingreso Lote Inicial Fac-1246 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(266,247,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1247 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(267,248,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1248 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(268,249,'ENTRADA_COMPRA',20,265,20,265,'Ingreso Lote Inicial Fac-1249 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(269,250,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1250 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(270,251,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1251 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(271,252,'ENTRADA_COMPRA',20,270,20,270,'Ingreso Lote Inicial Fac-1252 - Importadora Textil Italiana','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(272,253,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1253 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(273,254,'ENTRADA_COMPRA',20,386.4,20,386.4,'Ingreso Lote Inicial Fac-1254 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(274,255,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1255 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(275,256,'ENTRADA_COMPRA',20,420,20,420,'Ingreso Lote Inicial Fac-1256 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(276,257,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1257 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(277,258,'ENTRADA_COMPRA',20,453.6,20,453.6,'Ingreso Lote Inicial Fac-1258 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(278,259,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1259 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(279,260,'ENTRADA_COMPRA',20,495.6,20,495.6,'Ingreso Lote Inicial Fac-1260 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(280,261,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1261 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(281,262,'ENTRADA_COMPRA',20,197.4,20,197.4,'Ingreso Lote Inicial Fac-1262 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(282,263,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1263 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(283,264,'ENTRADA_COMPRA',20,210,20,210,'Ingreso Lote Inicial Fac-1264 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(284,265,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1265 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(285,266,'ENTRADA_COMPRA',20,222.6,20,222.6,'Ingreso Lote Inicial Fac-1266 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(286,267,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1267 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(287,268,'ENTRADA_COMPRA',20,226.8,20,226.8,'Ingreso Lote Inicial Fac-1268 - Hilanderías del Sur SRL','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(288,269,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1269 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(289,270,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1270 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(290,271,'ENTRADA_COMPRA',20,112.5,20,112.5,'Ingreso Lote Inicial Fac-1271 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(291,272,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1272 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(292,273,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1273 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(293,274,'ENTRADA_COMPRA',20,125,20,125,'Ingreso Lote Inicial Fac-1274 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(294,275,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1275 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(295,276,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1276 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(296,277,'ENTRADA_COMPRA',20,137.5,20,137.5,'Ingreso Lote Inicial Fac-1277 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(297,278,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1278 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(298,279,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1279 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(299,280,'ENTRADA_COMPRA',20,150,20,150,'Ingreso Lote Inicial Fac-1280 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(300,281,'ENTRADA_COMPRA',20,110,20,110,'Ingreso Lote Inicial Fac-1281 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(301,282,'ENTRADA_COMPRA',20,95,20,95,'Ingreso Lote Inicial Fac-1282 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(302,283,'ENTRADA_COMPRA',20,126,20,126,'Ingreso Lote Inicial Fac-1283 - Confecciones Andina SA','2026-09-15 12:00:00');
INSERT INTO "kardex_movimientos" VALUES(303,1,'RESERVA_LIBERADA',1,107.14,44,107.14,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-101','2026-09-21 11:59:47.034962');
INSERT INTO "kardex_movimientos" VALUES(304,1,'RESERVA_LIBERADA',1,107.14,44,107.14,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-105','2026-09-21 11:59:47.037380');
INSERT INTO "kardex_movimientos" VALUES(305,5,'RESERVA_LIBERADA',1,310,8,310,'Reserva Atendida en Probador Ticket #RES-2026-PRADO-501','2026-09-21 16:01:22.685042');
INSERT INTO "kardex_movimientos" VALUES(306,3,'RESERVA_LIBERADA',1,135,20,135,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-202','2026-09-21 16:08:38.159336');
INSERT INTO "kardex_movimientos" VALUES(307,3,'RESERVA_LIBERADA',1,135,20,135,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-201','2026-09-21 16:09:13.516246');
INSERT INTO "kardex_movimientos" VALUES(308,1,'RESERVA_LIBERADA',1,107.14,44,107.14,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-104','2026-09-21 16:10:03.658114');
INSERT INTO "kardex_movimientos" VALUES(309,1,'RESERVA_LIBERADA',1,107.14,44,107.14,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-103','2026-09-21 16:10:32.518674');
INSERT INTO "kardex_movimientos" VALUES(310,1,'RESERVA_LIBERADA',1,107.14,44,107.14,'Reserva Atendida en Probador Ticket #RES-2026-EQUI-102','2026-09-21 16:10:44.550518');
INSERT INTO "kardex_movimientos" VALUES(311,61,'RESERVA_APARTADA',1,112.5,19,112.5,'Reserva Web','2026-09-21 20:20:38.404501');
INSERT INTO "kardex_movimientos" VALUES(312,61,'SALIDA_VENTA',1,112.5,19,112.5,'Venta Online Factura FAC-2026-5736F7','2026-09-21 21:54:10.367393');
INSERT INTO "kardex_movimientos" VALUES(313,53,'SALIDA_VENTA',1,197.4,19,197.4,'Venta Online Factura FAC-2026-24F108','2026-09-21 21:55:09.722028');
INSERT INTO "kardex_movimientos" VALUES(314,61,'RESERVA_LIBERADA',1,112.5,19,112.5,'Reserva Atendida Ticket #RES-ceb9f13b-dc4f-496d-abe9-c140b0099d42-6','2026-09-21 21:55:21.319925');
INSERT INTO "kardex_movimientos" VALUES(315,53,'SALIDA_VENTA',1,197.4,18,197.4,'Venta Online Factura FAC-2026-389157','2026-09-21 21:55:39.895475');
INSERT INTO "kardex_movimientos" VALUES(316,61,'SALIDA_VENTA',2,112.5,17,112.5,'Venta Online Factura FAC-2026-A47D26','2026-09-21 21:56:19.064002');
INSERT INTO "kardex_movimientos" VALUES(317,53,'SALIDA_VENTA',1,197.4,17,197.4,'Venta Online Factura FAC-2026-A47D26','2026-09-21 21:56:19.064014');
INSERT INTO "kardex_movimientos" VALUES(318,61,'SALIDA_VENTA',1,112.5,16,112.5,'Venta Online Factura FAC-2026-04AA03','2026-09-21 22:04:16.272030');
INSERT INTO "kardex_movimientos" VALUES(319,45,'SALIDA_VENTA',1,386.4,19,386.4,'Venta Online Factura FAC-2026-DB25C0','2026-09-21 22:48:23.731890');
INSERT INTO "kardex_movimientos" VALUES(320,70,'SALIDA_VENTA',1,150,19,150,'Venta Online Factura FAC-2026-6EB7DC','2026-09-22 00:37:53.974615');
INSERT INTO "kardex_movimientos" VALUES(321,61,'SALIDA_VENTA',1,112.5,15,112.5,'Venta Online Factura FAC-2026-624A07','2026-09-22 00:38:50.991824');
INSERT INTO "kardex_movimientos" VALUES(322,61,'SALIDA_VENTA',1,112.5,14,112.5,'Venta Online Factura FAC-2026-384547','2026-09-22 00:54:04.171204');
CREATE TABLE marcas (
	id_marca INTEGER NOT NULL, 
	nombre_marca VARCHAR(50) NOT NULL, 
	PRIMARY KEY (id_marca), 
	UNIQUE (nombre_marca)
);
INSERT INTO "marcas" VALUES(1,'Oxford Heritage');
INSERT INTO "marcas" VALUES(2,'Urban Tailor');
INSERT INTO "marcas" VALUES(3,'Sartorial Milano');
INSERT INTO "marcas" VALUES(4,'Bocaccio Leather');
CREATE TABLE metodos_pago (
	id_metodo INTEGER NOT NULL, 
	codigo VARCHAR(50) NOT NULL, 
	nombre VARCHAR(100) NOT NULL, 
	tipo VARCHAR(30) NOT NULL, 
	descripcion VARCHAR(255), 
	icono VARCHAR(50), 
	activo BOOLEAN NOT NULL, 
	requiere_credenciales BOOLEAN NOT NULL, 
	credenciales_json TEXT, 
	creado_en DATETIME, 
	actualizado_en DATETIME, 
	PRIMARY KEY (id_metodo)
);
INSERT INTO "metodos_pago" VALUES(1,'EFECTIVO','Efectivo en Caja Mostrador','FISICO','Cobro presencial en billetes y monedas con cálculo automático de vuelto en sucursales.','fa-money-bill-wave',1,0,'{}','2026-09-20 16:16:42.877917','2026-09-20 16:16:42.877961');
INSERT INTO "metodos_pago" VALUES(2,'TARJETA_POS','Terminal POS / Tarjeta Física','FISICO','Cobro presencial con tarjetas Visa/Mastercard mediante datafast / terminal PinPad inalámbrico.','fa-credit-card',1,1,'{"terminal_id": "POS-DATAFAST-001", "banco_adquirente": "Banco Mercantil Santa Cruz"}','2026-09-20 16:16:42.877972','2026-09-20 16:16:42.877976');
INSERT INTO "metodos_pago" VALUES(3,'STRIPE','Pasarela Digital Stripe (Online)','DIGITAL','Cobro internacional en línea con tarjetas de crédito/débito, 3D Secure y tokenización PCI-DSS.','fa-stripe',1,1,'{"publishable_key": "pk_test_51UEsz81HD8WYieY5OVqcN7AqDcwmlIpf9ClUu7VzfdPDigt5FgbaTPuk8cErY6ySu3CXc8U0r7SY2UINr0e3AMyg00LCwwrfgN", "secret_key": "sk_test_51UEsz81HD8WYieY54Eoz9aGdj05qbsEnEbLOISaxEf5TF2E6RWswKA3lsGO0Au0YVodJ0JOqbRElxv5GUlgwcYHY00LRGUdXFK", "webhook_secret": "whsec_test"}','2026-09-20 16:16:42.877980','2026-09-20 16:16:42.877984');
INSERT INTO "metodos_pago" VALUES(4,'QR_BCB','Código QR Simple BCB Interoperable','OMNICANAL','Cobros instantáneos mediante códigos QR bajo el estándar interoperable del Banco Central de Bolivia.','fa-qrcode',1,1,'{"banco_origen": "Banco Central de Bolivia", "cuenta_recaudacion": "1000004928190", "comercio_id": "FASHIONSTORE-BO"}','2026-09-20 16:16:42.877987','2026-09-20 16:16:42.877991');
CREATE TABLE ordenes_detalle (
	id_detalle_orden INTEGER NOT NULL, 
	id_orden INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, 
	color VARCHAR(50) NOT NULL, 
	cantidad INTEGER NOT NULL, 
	precio_unitario NUMERIC(10, 2) NOT NULL, 
	subtotal NUMERIC(10, 2) NOT NULL, 
	PRIMARY KEY (id_detalle_orden), 
	FOREIGN KEY(id_orden) REFERENCES ordenes_venta (id_orden) ON DELETE CASCADE, 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE RESTRICT
);
INSERT INTO "ordenes_detalle" VALUES(1,1,7,'L','Celeste Pastel',2,325.5,651);
INSERT INTO "ordenes_detalle" VALUES(2,3,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(3,4,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(4,5,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(5,7,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(6,8,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(7,9,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(8,10,1,'M','Azul Marino',1,180,180);
INSERT INTO "ordenes_detalle" VALUES(9,12,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(10,13,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(11,14,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(12,15,7,'S','Blanco Puro',1,310,310);
INSERT INTO "ordenes_detalle" VALUES(13,17,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(14,18,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(15,19,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(16,20,1,'S','Blanco Puro',1,250,250);
INSERT INTO "ordenes_detalle" VALUES(17,21,1,'L','Azul Noche',1,190,190);
INSERT INTO "ordenes_detalle" VALUES(18,22,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(19,23,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(20,24,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(21,25,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(22,27,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(23,28,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(24,29,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(25,30,1,'S','Blanco Puro',1,250,250);
INSERT INTO "ordenes_detalle" VALUES(26,31,1,'L','Azul Noche',1,190,190);
INSERT INTO "ordenes_detalle" VALUES(27,33,1,'M','Azul Marino',1,280,280);
INSERT INTO "ordenes_detalle" VALUES(28,34,1,'M','Negro',1,150,150);
INSERT INTO "ordenes_detalle" VALUES(29,35,1,'M','Azul',1,100,100);
INSERT INTO "ordenes_detalle" VALUES(30,36,1,'S','Blanco Puro',1,250,250);
INSERT INTO "ordenes_detalle" VALUES(31,37,1,'L','Azul Noche',1,190,190);
INSERT INTO "ordenes_detalle" VALUES(32,38,1,'M','Azul Marino',1,180,180);
INSERT INTO "ordenes_detalle" VALUES(33,39,1,'M','Azul Marino',1,180,180);
INSERT INTO "ordenes_detalle" VALUES(34,40,1,'M','Azul Marino',1,180,180);
INSERT INTO "ordenes_detalle" VALUES(35,41,3,'40','Gris Plomo',2,520,1040);
INSERT INTO "ordenes_detalle" VALUES(36,42,7,'S','Blanco Puro',2,294.5,589);
INSERT INTO "ordenes_detalle" VALUES(37,42,6,'39','Azul Marino',1,437,437);
INSERT INTO "ordenes_detalle" VALUES(38,43,6,'39','Azul Marino',1,437,437);
INSERT INTO "ordenes_detalle" VALUES(39,44,6,'39','Azul Marino',1,437,437);
INSERT INTO "ordenes_detalle" VALUES(40,45,7,'S','Blanco Puro',1,294.5,294.5);
INSERT INTO "ordenes_detalle" VALUES(41,46,7,'S','Blanco Puro',1,294.5,294.5);
INSERT INTO "ordenes_detalle" VALUES(42,47,5,'38','Azul Noche',1,931,931);
INSERT INTO "ordenes_detalle" VALUES(43,48,7,'XL','Blanco Puro',1,341,341);
INSERT INTO "ordenes_detalle" VALUES(44,49,7,'S','Blanco Puro',1,294.5,294.5);
INSERT INTO "ordenes_detalle" VALUES(45,50,7,'S','Blanco Puro',1,294.5,294.5);
CREATE TABLE ordenes_venta (
	id_orden INTEGER NOT NULL, 
	id_usuario INTEGER, 
	id_sucursal INTEGER, 
	numero_factura VARCHAR(50), 
	canal_venta VARCHAR(20) NOT NULL, 
	modalidad_entrega VARCHAR(20) NOT NULL, 
	direccion_envio VARCHAR(255), 
	telefono_contacto VARCHAR(30), 
	nit_factura VARCHAR(30), 
	razon_social_factura VARCHAR(150), 
	notas_entrega TEXT, 
	subtotal NUMERIC(10, 2) NOT NULL, 
	costo_envio NUMERIC(10, 2) NOT NULL, 
	total NUMERIC(10, 2) NOT NULL, 
	estado_pago VARCHAR(20) NOT NULL, 
	estado_logistica VARCHAR(30) NOT NULL, 
	creado_en DATETIME, 
	id_repartidor INTEGER, 
	nombre_repartidor VARCHAR(100), 
	telefono_repartidor VARCHAR(30), 
	latitud_destino NUMERIC(10, 8), 
	longitud_destino NUMERIC(11, 8), 
	distancia_km NUMERIC(6, 2), 
	PRIMARY KEY (id_orden), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL, 
	FOREIGN KEY(id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE SET NULL, 
	UNIQUE (numero_factura), 
	FOREIGN KEY(id_repartidor) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);
INSERT INTO "ordenes_venta" VALUES(1,1,NULL,'FAC-2026-C283BC','WEB','DELIVERY','Elpepe','77838805','13306632','Alberto Delgado','Presidente',651,25,676,'PAGADO','ENTREGADA','2026-09-20 23:51:26.369917',NULL,'Ratero','palo',NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(2,1,1,'POS-VENCIDO-1790012382','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 13:39:42.656800',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(3,1,1,'POS-CAMBIO-1790012382','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 13:39:42.698748',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(4,1,1,'POS-VALE-1790012382','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 13:39:42.796170',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(5,1,1,'POS-VENCIDO2-1790012382','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 13:39:42.853296',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(6,1,1,'POS-VENCIDO-1790012502','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 13:41:42.993302',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(7,1,1,'POS-CAMBIO-1790012503','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 13:41:43.041696',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(8,1,1,'POS-VALE-1790012503','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 13:41:43.166189',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(9,1,1,'POS-VENCIDO2-1790012503','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 13:41:43.224474',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(10,1,1,'POS-2026-0042','POS','COMPRA_FISICA',NULL,NULL,'4912044019','Carlos Mendoza',NULL,180,0,180,'PAGADO','ENTREGADA','2026-09-16 13:43:10.265231',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(11,1,1,'POS-VENCIDO-1790012605','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 13:43:25.630999',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(12,1,1,'POS-CAMBIO-1790012605','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 13:43:25.673271',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(13,1,1,'POS-VALE-1790012605','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 13:43:25.780582',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(14,1,1,'POS-VENCIDO2-1790012605','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 13:43:25.840547',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(15,1,1,'RES-54e9f0a0-93ff-4876-b7ec-fd86cfcd3dc8-1','POS','COMPRA_FISICA',NULL,NULL,'0','Alberto Delgado',NULL,310,0,310,'PAGADO','ENTREGADA','2026-09-20 23:46:30.618593',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(16,1,1,'POS-VENCIDO-1790014001','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 14:06:41.889984',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(17,1,1,'POS-CAMBIO-1790014001','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 14:06:41.926026',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(18,1,1,'POS-VALE-1790014002','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:06:42.021608',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(19,1,1,'POS-VENCIDO2-1790014002','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 14:06:42.581835',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(20,1,1,'POS-REEMB-1790014002','POS','COMPRA_FISICA',NULL,NULL,'4499112','Juan Reembolso',NULL,250,0,250,'PAGADO','ENTREGADA','2026-09-20 14:06:42.629682',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(21,1,1,'POS-MERMA-1790014002','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Falla Confeccion',NULL,190,0,190,'PAGADO','ENTREGADA','2026-09-18 14:06:42.707809',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(22,1,1,'POS-VALE-1790014022','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:07:02.251610',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(23,1,1,'POS-VALE-1790014039','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:07:19.095859',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(24,1,1,'POS-VALE-1790014054','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:07:34.662271',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(25,1,1,'POS-VALE-1790014085','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:08:05.550207',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(26,1,1,'POS-VENCIDO-1790014125','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 14:08:45.528154',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(27,1,1,'POS-CAMBIO-1790014125','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 14:08:45.568266',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(28,1,1,'POS-VALE-1790014125','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:08:45.685145',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(29,1,1,'POS-VENCIDO2-1790014125','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 14:08:45.745100',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(30,1,1,'POS-REEMB-1790014125','POS','COMPRA_FISICA',NULL,NULL,'4499112','Juan Reembolso',NULL,250,0,250,'PAGADO','ENTREGADA','2026-09-20 14:08:45.777278',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(31,1,1,'POS-MERMA-1790014125','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Falla Confeccion',NULL,190,0,190,'PAGADO','ENTREGADA','2026-09-18 14:08:45.836834',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(32,1,1,'POS-VENCIDO-1790015142','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,180,0,180,'PAGADO','ENTREGADA','2026-08-30 14:25:42.764451',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(33,1,1,'POS-CAMBIO-1790015142','POS','COMPRA_FISICA',NULL,NULL,'123456','Carlos Mendoza',NULL,280,0,280,'PAGADO','ENTREGADA','2026-09-18 14:25:42.812340',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(34,1,1,'POS-VALE-1790015142','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vale',NULL,150,0,150,'PAGADO','ENTREGADA','2026-09-19 14:25:42.915136',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(35,1,1,'POS-VENCIDO2-1790015142','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Vencido',NULL,100,0,100,'PAGADO','ENTREGADA','2026-08-22 14:25:42.970375',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(36,1,1,'POS-REEMB-1790015143','POS','COMPRA_FISICA',NULL,NULL,'4499112','Juan Reembolso',NULL,250,0,250,'PAGADO','ENTREGADA','2026-09-20 14:25:43.005782',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(37,1,1,'POS-MERMA-1790015143','POS','COMPRA_FISICA',NULL,NULL,'0','Cliente Falla Confeccion',NULL,190,0,190,'PAGADO','ENTREGADA','2026-09-18 14:25:43.065312',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(38,1,1,'POS-2026-0055','POS','COMPRA_FISICA',NULL,NULL,'4912044019','Cliente Mostrador',NULL,180,0,180,'PAGADO','ENTREGADA','2026-09-17 15:45:00',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(39,1,1,'FAC-2026-0081','WEB','COMPRA_FISICA',NULL,NULL,'4912044019','Cliente Mostrador',NULL,180,0,180,'PAGADO','ENTREGADA','2026-09-18 10:20:00',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(40,1,1,'POS-2026-0099','POS','COMPRA_FISICA',NULL,NULL,'4912044019','Cliente Mostrador',NULL,180,0,180,'PAGADO','ENTREGADA','2026-09-18 16:10:00',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(41,1,4,'POS-2026-0077','POS','COMPRA_FISICA',NULL,NULL,'4912044019','Cliente Mostrador',NULL,1040,0,1040,'PAGADO','ENTREGADA','2026-09-19 14:00:00',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(42,6,NULL,'FAC-2026-A47D26','APP','DELIVERY','Av. San Martín #450, Equipetrol, Santa Cruz','77838805','4859201','Rodrigo Paz','con cuidado por favor',1026,25,1051,'PAGADO','ENTREGADA','2026-09-21 20:59:23.907584',NULL,'Roberto','1131913',NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(43,6,NULL,'FAC-2026-389157','APP','DELIVERY','Av. San Martín #450, Equipetrol, Santa Cruz','70012345','4859201','Rodrigo Paz',NULL,437,25,462,'PAGADO','ENTREGADA','2026-09-21 21:01:04.264408',NULL,'Peres megia',NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(44,6,1,'FAC-2026-24F108','APP','RETIRO_TIENDA',NULL,'70012345','4859201','Rodrigo Paz',NULL,437,0,437,'PAGADO','ENTREGADA','2026-09-21 21:01:42.177490',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(45,6,1,'FAC-2026-5736F7','APP','RETIRO_TIENDA',NULL,'70012345','4859201','Rodrigo Paz',NULL,294.5,0,294.5,'PAGADO','ENTREGADA','2026-09-21 21:54:02.955850',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(46,6,NULL,'FAC-2026-04AA03','APP','DELIVERY','Av. San Martín #450, Equipetrol, Santa Cruz','70012345','4859201','Rodrigo Paz',NULL,294.5,25,319.5,'PAGADO','ENTREGADA','2026-09-21 22:03:57.659501',NULL,'Pepito','899199',NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(47,6,NULL,'FAC-2026-DB25C0','APP','DELIVERY','Av. San Martín #450, Equipetrol, Santa Cruz','70012345','4859201','Rodrigo Paz',NULL,931,25,956,'PAGADO','ENTREGADA','2026-09-21 22:48:08.029687',NULL,'Nicolas','991839819',NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(48,6,1,'FAC-2026-6EB7DC','APP','RETIRO_TIENDA',NULL,'70012345','4859201','Rodrigo Paz',NULL,341,0,341,'PAGADO','LISTO_DESPACHO','2026-09-21 22:59:26.201087',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(49,6,1,'FAC-2026-624A07','APP','RETIRO_TIENDA',NULL,'70012345','4859201','Rodrigo Paz',NULL,294.5,0,269.5,'PAGADO','LISTO_DESPACHO','2026-09-22 00:38:46.598705',NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "ordenes_venta" VALUES(50,6,NULL,'FAC-2026-384547','APP','DELIVERY','Av. San Martín #450, Equipetrol, Santa Cruz','70012345','4859201','Rodrigo Paz',NULL,294.5,25,269.5,'PAGADO','PREPARACION','2026-09-22 00:53:57.411901',NULL,NULL,NULL,NULL,NULL,NULL);
CREATE TABLE producto_colores (
	id_color INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	color_nombre VARCHAR(50) NOT NULL, 
	codigo_hex VARCHAR(10) NOT NULL, 
	PRIMARY KEY (id_color), 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
);
INSERT INTO "producto_colores" VALUES(1,1,'Azul Marino','#000080');
INSERT INTO "producto_colores" VALUES(2,1,'Blanco Óptico','#FFFFFF');
INSERT INTO "producto_colores" VALUES(3,1,'Celeste Cielo','#87CEEB');
INSERT INTO "producto_colores" VALUES(4,2,'Beige Arena','#F5F5DC');
INSERT INTO "producto_colores" VALUES(5,2,'Azul Noche','#191970');
INSERT INTO "producto_colores" VALUES(6,2,'Verde Oliva','#556B2F');
INSERT INTO "producto_colores" VALUES(7,3,'Azul Cobalto','#0047AB');
INSERT INTO "producto_colores" VALUES(8,3,'Gris Plomo','#708090');
INSERT INTO "producto_colores" VALUES(9,4,'Negro Clásico','#1A1A1A');
INSERT INTO "producto_colores" VALUES(10,4,'Marrón Suizo','#5C4033');
INSERT INTO "producto_colores" VALUES(11,4,'Cognac','#9E4714');
INSERT INTO "producto_colores" VALUES(12,5,'Azul Noche','#191970');
INSERT INTO "producto_colores" VALUES(13,5,'Gris Marengo','#4A4E69');
INSERT INTO "producto_colores" VALUES(14,6,'Azul Marino','#000080');
INSERT INTO "producto_colores" VALUES(15,6,'Tabaco','#6F4E37');
INSERT INTO "producto_colores" VALUES(16,7,'Blanco Puro','#FFFFFF');
INSERT INTO "producto_colores" VALUES(17,7,'Verde Salvia','#8A9A5B');
INSERT INTO "producto_colores" VALUES(18,7,'Celeste Pastel','#B0E0E6');
CREATE TABLE producto_tallas (
	id_talla INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, precio NUMERIC(10, 2), 
	PRIMARY KEY (id_talla), 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
);
INSERT INTO "producto_tallas" VALUES(1,1,'S',266);
INSERT INTO "producto_tallas" VALUES(2,1,'M',280);
INSERT INTO "producto_tallas" VALUES(3,1,'L',294);
INSERT INTO "producto_tallas" VALUES(4,1,'XL',308);
INSERT INTO "producto_tallas" VALUES(5,2,'30',304);
INSERT INTO "producto_tallas" VALUES(6,2,'32',320);
INSERT INTO "producto_tallas" VALUES(7,2,'34',336);
INSERT INTO "producto_tallas" VALUES(8,2,'36',352);
INSERT INTO "producto_tallas" VALUES(9,3,'38',617.5);
INSERT INTO "producto_tallas" VALUES(10,3,'40',650);
INSERT INTO "producto_tallas" VALUES(11,3,'42',682.5);
INSERT INTO "producto_tallas" VALUES(12,4,'39',513);
INSERT INTO "producto_tallas" VALUES(13,4,'40',540);
INSERT INTO "producto_tallas" VALUES(14,4,'41',567);
INSERT INTO "producto_tallas" VALUES(15,4,'42',567);
INSERT INTO "producto_tallas" VALUES(16,5,'38',931);
INSERT INTO "producto_tallas" VALUES(17,5,'40',980);
INSERT INTO "producto_tallas" VALUES(18,5,'42',1029);
INSERT INTO "producto_tallas" VALUES(19,5,'44',1078);
INSERT INTO "producto_tallas" VALUES(20,6,'39',437);
INSERT INTO "producto_tallas" VALUES(21,6,'40',460);
INSERT INTO "producto_tallas" VALUES(22,6,'41',483);
INSERT INTO "producto_tallas" VALUES(23,6,'42',483);
INSERT INTO "producto_tallas" VALUES(24,7,'S',294.5);
INSERT INTO "producto_tallas" VALUES(25,7,'M',310);
INSERT INTO "producto_tallas" VALUES(26,7,'L',325.5);
INSERT INTO "producto_tallas" VALUES(27,7,'XL',341);
CREATE TABLE productos (
	id_producto INTEGER NOT NULL, 
	id_categoria INTEGER NOT NULL, 
	id_marca INTEGER NOT NULL, 
	id_temporada INTEGER, 
	id_proveedor INTEGER, 
	codigo_sku_base VARCHAR(50) NOT NULL, 
	nombre VARCHAR(150) NOT NULL, 
	descripcion TEXT, 
	precio_base NUMERIC(10, 2) NOT NULL, 
	imagen_principal VARCHAR(255), 
	modelo_3d_glb VARCHAR(255), 
	estado VARCHAR(30) NOT NULL, 
	PRIMARY KEY (id_producto), 
	FOREIGN KEY(id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT, 
	FOREIGN KEY(id_marca) REFERENCES marcas (id_marca) ON DELETE RESTRICT, 
	FOREIGN KEY(id_temporada) REFERENCES temporadas (id_temporada) ON DELETE SET NULL, 
	FOREIGN KEY(id_proveedor) REFERENCES proveedores (id_proveedor) ON DELETE SET NULL
);
INSERT INTO "productos" VALUES(1,1,1,1,1,'SHIRT-SLIM-001','Camisa Oxford Slim Fit','Camisa de corte entallado en 100% algodón egipcio, cuello italiano y botones nacarados',280,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80','https://assets.fashionstore.bo/models/shirt_oxford_slim.glb','PUBLICADO');
INSERT INTO "productos" VALUES(2,2,2,1,2,'PANT-CHINO-002','Pantalón Chino Gabardina','Pantalón casual de gabardina elastizada con bolsillos traseros tipo ojal y pretina reforzada',320,'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80','https://assets.fashionstore.bo/models/pant_chino_gab.glb','PUBLICADO');
INSERT INTO "productos" VALUES(3,3,3,2,3,'BLAZ-LINO-003','Blazer de Lino Casual','Chaqueta ligera desestructurada de lino italiano ideal para eventos formales y cócteles',650,'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80','https://assets.fashionstore.bo/models/blazer_lino_casual.glb','PUBLICADO');
INSERT INTO "productos" VALUES(4,4,4,2,3,'SHOE-OXFD-004','Zapato Oxford Cap-Toe Cuero Genuino','Calzado formal artesanal en cuero vacuno plena flor con suela de cuero cosida Goodyear Welted',540,'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80','https://assets.fashionstore.bo/models/oxford_shoes.glb','PUBLICADO');
INSERT INTO "productos" VALUES(5,3,3,1,1,'SUIT-SLIM-005','Traje Ejecutivo Slim Fit 2 Piezas','Conjunto formal de saco y pantalón entallado en lana fría super 120s para ocasiones de gala y corporativas',980,'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80','https://assets.fashionstore.bo/models/suit_executive.glb','PUBLICADO');
INSERT INTO "productos" VALUES(6,4,4,1,2,'MOCA-LOAF-006','Mocasín Náutico Confort de Cuero','Mocasín sin cordones de cuero gamuzado ultra flexible con plantilla ortopédica acolchada',460,'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80','https://assets.fashionstore.bo/models/mocasines.glb','PUBLICADO');
INSERT INTO "productos" VALUES(7,1,1,1,1,'SHIRT-LINO-007','Camisa de Lino Cuello Mao Italiana','Camisa veraniega fresca en 100% lino natural lavado con cuello oriental y botones madera',310,'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80','https://assets.fashionstore.bo/models/shirt_lino_mao.glb','PUBLICADO');
CREATE TABLE proveedores (
	id_proveedor INTEGER NOT NULL, 
	nit_identificacion VARCHAR(30) NOT NULL, 
	razon_social VARCHAR(150) NOT NULL, 
	contacto_nombre VARCHAR(100), 
	telefono VARCHAR(30), 
	email VARCHAR(100), 
	terminos_pago VARCHAR(50) NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id_proveedor)
);
INSERT INTO "proveedores" VALUES(1,'1028392019','Confecciones Andina SA','Juan Paredes','+591 70012345','ventas@andina.com.bo','CREDITO_30_DIAS','ACTIVO');
INSERT INTO "proveedores" VALUES(2,'9038472011','Hilanderías del Sur SRL','Marcos Vaca','+591 71098765','contacto@hilasur.bo','CONTADO','ACTIVO');
INSERT INTO "proveedores" VALUES(3,'3829104018','Importadora Textil Italiana','Gianluca Rossi','+591 72055443','grossi@textilitaliana.com','CREDITO_60_DIAS','ACTIVO');
CREATE TABLE recompensas_catalogo (
	id_recompensa INTEGER NOT NULL, 
	codigo VARCHAR(50) NOT NULL, 
	tenant_id VARCHAR(50) NOT NULL, 
	titulo VARCHAR(100) NOT NULL, 
	descripcion TEXT, 
	costo_puntos INTEGER NOT NULL, 
	descuento_monto NUMERIC(10, 2) NOT NULL, 
	categoria VARCHAR(50) NOT NULL, 
	icono VARCHAR(50) NOT NULL, 
	activo BOOLEAN NOT NULL, 
	PRIMARY KEY (id_recompensa), 
	UNIQUE (codigo)
);
INSERT INTO "recompensas_catalogo" VALUES(1,'DESC_50BS','fashionstore_scz','Bono de 50 Bs.','Descuento directo aplicable en el checkout digital o en caja POS.',300,50,'Descuento','local_offer',1);
INSERT INTO "recompensas_catalogo" VALUES(2,'CUPON_25BS','fashionstore_scz','Descuento de 25 Bs.','Cupón de 25 Bs aplicable a cualquier compra en línea o tienda física.',200,25,'Descuento','local_offer',1);
INSERT INTO "recompensas_catalogo" VALUES(3,'ENVIO_FREE','fashionstore_scz','Envío Express Bonificado','Cubre el 100% de la tarifa de delivery metropolitano en compras.',150,25,'Logística','local_shipping',1);
INSERT INTO "recompensas_catalogo" VALUES(4,'PROBADOR_EXPRESS','fashionstore_scz','Pase Prioritario de Probador','Atención preferencial sin espera en cualquier sucursal física.',200,0,'Experiencia','airline_seat_recline_extra',1);
INSERT INTO "recompensas_catalogo" VALUES(5,'ASESORIA_VIP','fashionstore_scz','Asesoría de Imagen Personal','Sesión personalizada de estilismo y colorimetría con un experto.',500,100,'Exclusivo','stars',1);
CREATE TABLE reserva_detalles (
	id_reserva_detalle INTEGER NOT NULL, 
	id_reserva INTEGER NOT NULL, 
	id_producto INTEGER NOT NULL, 
	talla VARCHAR(20) NOT NULL, 
	color VARCHAR(50) NOT NULL, 
	cantidad INTEGER NOT NULL, 
	PRIMARY KEY (id_reserva_detalle), 
	FOREIGN KEY(id_reserva) REFERENCES reservas (id_reserva) ON DELETE CASCADE, 
	FOREIGN KEY(id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
);
INSERT INTO "reserva_detalles" VALUES(1,1,7,'S','Blanco Puro',1);
INSERT INTO "reserva_detalles" VALUES(2,2,5,'38','Azul Noche',1);
INSERT INTO "reserva_detalles" VALUES(3,3,1,'M','Azul Marino',1);
INSERT INTO "reserva_detalles" VALUES(4,4,1,'M','Azul Marino',1);
INSERT INTO "reserva_detalles" VALUES(5,5,1,'M','Azul Marino',1);
INSERT INTO "reserva_detalles" VALUES(6,6,1,'M','Azul Marino',1);
INSERT INTO "reserva_detalles" VALUES(7,7,1,'M','Azul Marino',1);
INSERT INTO "reserva_detalles" VALUES(8,8,2,'32','Beige Arena',1);
INSERT INTO "reserva_detalles" VALUES(9,9,2,'32','Beige Arena',1);
INSERT INTO "reserva_detalles" VALUES(10,10,3,'40','Gris Plomo',1);
INSERT INTO "reserva_detalles" VALUES(11,11,7,'S','Blanco Puro',1);
CREATE TABLE reservas (
	id_reserva INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	id_sucursal INTEGER NOT NULL, 
	codigo_qr TEXT NOT NULL, 
	qr_texto VARCHAR(200), 
	fecha_visita DATETIME NOT NULL, 
	estado VARCHAR(30), 
	creado_en DATETIME, 
	PRIMARY KEY (id_reserva), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE, 
	FOREIGN KEY(id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE CASCADE, 
	UNIQUE (codigo_qr), 
	UNIQUE (qr_texto)
);
INSERT INTO "reservas" VALUES(1,1,1,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAACyUlEQVR4nO1bUY6cMAy1DdJ8BqkH6FGYG+yR9mrkKBxgpZnPkUCubIdhS1eQaVVKit/HCvDTyMIkfrazyPAKIr1EB3D+OmjDvoTz10Eb9iWcvw7asC/h/HXQhn0J55/h/WBCDRAREeA+X2HCdUd/8kEvcE/Mb1lwk6tbxRC/P1CfAUClJj62/9mgk/LvaYXan/e+lqsxPdOFva8/uaBs5jn59ZdPYwPAsbkx7u0POX+H+LYdALY9AsP9z36fnP9P3w9Yck35t7I0a5kYoGJNx58oncdrHXRMflSJ3CR9hVcLLQhGk8/7+pMNyqeeeH/m+UFsKrkdZGseESDwof0n5+fUv1crc2vZmke00jc2sl1Php/4+SDnH0I/B12mIzKEocaWRV/xiBybakAxqObyeJWpr1iklaqqJK3CANyFp+aSW4XrqyLjC9q1almiOqnmpKkn6ez6ueD48rxWLci2fodpJc+8o/lPzs/Iv9j29YAQHjJQ+CZdqwvLMxHRF0YIVir5+yz2ewuSYfs6tSaZJdKBGWIjRdL+/uSCspmnzr8GCah1rb5IvQrfn0uNb8WaZpOMmvQzSMxVc3l8S58voFS9UgTXLOGe5guyPYcP5GP6T87PWb8tD9Z6TrdSCXeyU+ue7ftz8d/b/SKxfEzHcGT9vmvMTXOlSf9x/c8FnXc+CElapar3E3Q5u74qN74zUixlp+4mJW0iS+H6ucz+BhiqQUaDNbbdA1nmC9LuGI7sPzn/pfOTKEN+7uR8LJi+UuHl+fc/OT+pwGtgtuMcNgn2+W/p8X2i7S/W6bB2pY4b0nGsIvzfAJ39/GSUo+0Cjm8P5IiVzBcG6Xns4Q85/++d37jDc2D0UaOsZO1pcXz77d8n5x9nvgDP0YL2r0Ia/c6NLa+PSvue0f+/u6h4kfNXQevmX+D8ddCGfQnnr4M27Es4fx2lv58fEzfZCF4Hcp4AAAAASUVORK5CYII=','RES-54e9f0a0-93ff-4876-b7ec-fd86cfcd3dc8-1','2026-09-21 09:00:00.000000','ATENDIDA','2026-09-20 23:46:30.618593');
INSERT INTO "reservas" VALUES(2,6,1,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAACqUlEQVR4nO1bTY6rMAz+bJC6TKV3gHcUerN3NXqUHmAkWFZq5Sc7CWUYKdDFdMjU34IC/hZWjB3/pCR4Bmd+ig44vwxekS/h/DJ4Rb6E88vgFfkSzi+DV+RLOP8d1ocSWuCsl+kdMGbZ6YX6bAc/wX1jfieKwe5uMKvaGwCN3ci+9d8MflP+mDyU6Hgns2py2OjJ7d713wp+d353aUH090oWqR9G/il9VsBrhAWcj0akHw8ifbiS9L4+VX8/bfoNusGO6YE6uRO6yyHuurJj/dn5W9bnbCnycXo9JtPSCfeYPn/mbwY7fwf+K7M3GpUx3vMFnxuYbq8yeGd8xOKnG6at127CDdJbaTQJDP3e9Gfnb7KvqPGClrnhBnRDI6kSRpMcOFJ8PcvgXdpX1GvNYZNBzchijp0e3X9r7k/+M19VqwKWOreQfmxnkdr7k1XaF2ljlbzhapBO7hxSuLZN2P234vyZEAYhhA/NmklDsxbBF4JopUSxOn6JPuz8b/HfwR40q1Jf7S0qB8u5zH89f670+0SKu9GWOZNONm9mmZbH56rtC8xroZhpBTP3VAl7fVStfRERS9+UWsWsKtZMXh9Vbt8uuuli0i/uv/xL5keG8NHiTNZybm7A+EejdBMTa3T9HvVn52/tP4tVvTGTjl2NDJP6/lt1fyMhzRIsdYY1oa3JkcXef678/KSIXHUSfNfzdVc9P9lG/32pPtvBT3DfmN+Zdw52vi6Njug0TRq0J+395+rnv91sVpTr3wd8PvhL+E3ehC9EuT/5k/oUwWXxFzh/bPNx6KCOfTkInR7ptK9PGbzz85Ni8199JIxHoOs1yXqdPuz87+tPwvbffEgHj66z959r/T7J/99dlb3Y+UVwWfwFzi+DV+RLOL8MXpEv4fwyal+f/yG58IE80gCTAAAAAElFTkSuQmCC','RES-f7d89378-0e51-45b0-84fd-d74c2aa6e93b-6','2026-09-21 11:00:00.000000','ATENDIDA','2026-09-20 23:48:14.646347');
INSERT INTO "reservas" VALUES(3,1,1,'data:image/png;base64,RES-2026-EQUI-101','RES-2026-EQUI-101','2026-09-22 15:00:00','ATENDIDA','2026-09-21 11:00:00');
INSERT INTO "reservas" VALUES(4,1,1,'data:image/png;base64,RES-2026-EQUI-102','RES-2026-EQUI-102','2026-09-22 15:00:00','ATENDIDA','2026-09-21 11:05:00');
INSERT INTO "reservas" VALUES(5,1,1,'data:image/png;base64,RES-2026-EQUI-103','RES-2026-EQUI-103','2026-09-22 15:00:00','ATENDIDA','2026-09-21 11:10:00');
INSERT INTO "reservas" VALUES(6,1,1,'data:image/png;base64,RES-2026-EQUI-104','RES-2026-EQUI-104','2026-09-22 15:00:00','ATENDIDA','2026-09-21 11:15:00');
INSERT INTO "reservas" VALUES(7,1,1,'data:image/png;base64,RES-2026-EQUI-105','RES-2026-EQUI-105','2026-09-22 15:00:00','ATENDIDA','2026-09-21 11:20:00');
INSERT INTO "reservas" VALUES(8,1,1,'data:image/png;base64,RES-2026-EQUI-201','RES-2026-EQUI-201','2026-09-22 15:00:00','ATENDIDA','2026-09-21 09:15:00');
INSERT INTO "reservas" VALUES(9,1,1,'data:image/png;base64,RES-2026-EQUI-202','RES-2026-EQUI-202','2026-09-22 15:00:00','ATENDIDA','2026-09-21 09:30:00');
INSERT INTO "reservas" VALUES(10,1,4,'data:image/png;base64,RES-2026-PRADO-501','RES-2026-PRADO-501','2026-09-22 15:00:00','ATENDIDA','2026-09-21 08:45:00');
INSERT INTO "reservas" VALUES(11,6,1,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAAC4ElEQVR4nO1bW46kMAy0DdJ8BmkPMEdJ32w1R9obwFH6ACPBZ0sgr+zwGkYKQTuNOovrAwIpISvVTmwnjQxH0NAhOoDx46Cd/i2MHwft9G9h/Dhop38L48dBO/1bGP8K44MjSoAGEaGZW9BNfbcT7UkHHeBekV+Gm6/l2v0C8G0F6HlA8CH0Knq94Tn2kPGfMj7d6KGI78xcdyWwSD6+E3f+t++ngpKZAcY/OD7+XgJiVTBiBUHkH/3+DmiPsIHxD45PU+nU3APzfV51f/D7O6A9wgbGj6Mc704W2078908lrQo4LL0dSGuGjWcc9Jr8RkNkURagED0LDkvvDYYQPp9rTzIonXph/+X1qwEB3AMZ4CEtfmn7yfhxsAB8qw8Fc63+6yQpcl86FLWNZxz0kvpy7XrgehKUuRVBW42fdbqWhdn0zVhfGFddVTWIXMs7L0qr+ua/Oevr9NaP0kprdGKZvcNMbf6bM39AvHVvwYmhqbSS9Qj5r2bCY6XjZe1PBF0zvgINrcRNNbTyq/UXxqXX5ueM9fUyNevjHD9PkkrgZfHzf5H/upAM6WN4heBalstZ9pDxnxM/L5j8t9b4+UukZflvnv6L4cF9lgxdJU+FeO0ncoPa0nLWGfaQ8Z+y/raa667LWeq1SyXL/Dfr36d7IDTvzOu9fCeR9F1zJsmeTrUnFZTMvCYfVvHzKitSr50xO7atv3nqu2DaVZh2GnxQf4LtL2R+fpJrGJA/wiGOh5yflOlaLyfakw46wL0w36t3tgD4+17KYy9b+8UcX42Vype1Pxl08fOTIPNzaDVynGM5Dn2uPamgZGbA5fmNHm2vJNK6i6paqZzLVzY+mf1+ym9vpBbp60E7kKF7k/pGX1p9I+/8l0ORMhxt/5CjzwK8hUrl6fakgpKZF98fVIwJ0TIhs2bCITEWWH6Umb5o/+/OSi8yfhQU7/4G48dBO/1bGD8O2unfwvhx5D4+fwGFasgN9BwR9gAAAABJRU5ErkJggg==','RES-ceb9f13b-dc4f-496d-abe9-c140b0099d42-6','2026-09-22 15:00:00.000000','ATENDIDA','2026-09-21 20:20:38.399764');
CREATE TABLE sucursales (
	id_sucursal INTEGER NOT NULL, 
	id_ciudad INTEGER NOT NULL, 
	nombre_sucursal VARCHAR(100) NOT NULL, 
	direccion VARCHAR(200) NOT NULL, 
	latitud NUMERIC(10, 8) NOT NULL, 
	longitud NUMERIC(11, 8) NOT NULL, 
	telefono VARCHAR(20), 
	capacidad_probadores INTEGER NOT NULL, 
	horario_apertura VARCHAR(10) NOT NULL, 
	horario_cierre VARCHAR(10) NOT NULL, 
	estado VARCHAR(30) NOT NULL, 
	PRIMARY KEY (id_sucursal), 
	FOREIGN KEY(id_ciudad) REFERENCES ciudades (id_ciudad) ON DELETE CASCADE
);
INSERT INTO "sucursales" VALUES(1,1,'Sucursal Equipetrol','Av. San Martín #450, entre 3er y 4to anillo',-17.76823,-63.18342,'3-3445566',6,'09:00','21:00','OPERATIVA');
INSERT INTO "sucursales" VALUES(2,1,'Sucursal Centro','Calle 21 de Mayo esq. Ayacucho',-17.78312,-63.1821,'3-3332211',4,'09:00','20:00','OPERATIVA');
INSERT INTO "sucursales" VALUES(3,2,'Sucursal Calacoto','Av. Ballivián #1200, Calle 18',-16.53982,-68.08921,'2-2778899',5,'09:30','21:00','OPERATIVA');
INSERT INTO "sucursales" VALUES(4,3,'Sucursal El Prado','Av. Ballivián #600, El Prado',-17.38921,-66.15672,'4-4223344',4,'09:00','20:30','OPERATIVA');
CREATE TABLE temporadas (
	id_temporada INTEGER NOT NULL, 
	codigo_campana VARCHAR(30) NOT NULL, 
	nombre_temporada VARCHAR(100) NOT NULL, 
	fecha_inicio DATE NOT NULL, 
	fecha_fin DATE NOT NULL, 
	descuento_liquidacion NUMERIC(5, 2) NOT NULL, 
	estado VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id_temporada)
);
INSERT INTO "temporadas" VALUES(1,'SS-2026','Primavera - Verano 2026','2026-08-01','2027-01-31',0,'VIGENTE');
INSERT INTO "temporadas" VALUES(2,'FW-2026','Otoño - Invierno 2026','2026-02-01','2026-07-31',25,'LIQUIDACION');
INSERT INTO "temporadas" VALUES(3,'12314','Navidad','2026-12-24','2026-12-25',80,'VIGENTE');
CREATE TABLE tokens_recuperacion (
	id_token INTEGER NOT NULL, 
	id_usuario INTEGER NOT NULL, 
	codigo_otp_hash VARCHAR(120) NOT NULL, 
	expiracion DATETIME NOT NULL, 
	utilizado BOOLEAN NOT NULL, 
	intentos_verificacion INTEGER NOT NULL, 
	fecha_creacion DATETIME, 
	PRIMARY KEY (id_token), 
	FOREIGN KEY(id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);
INSERT INTO "tokens_recuperacion" VALUES(1,6,'$2b$12$Z8Ccxi3sSPjRyxqzE8GixuKRWAdflO3SHPq0CTqngNCctMnxADd3S','2026-09-18 18:56:51.992990',1,0,'2026-09-18 18:41:51.994830');
INSERT INTO "tokens_recuperacion" VALUES(2,6,'$2b$12$ScSefPhqsZxKJasSvN2j1OauE7V/GhJ7kzau9unSi6FGSFZ/RosXq','2026-09-19 15:19:29.926929',1,0,'2026-09-19 15:04:29.929007');
INSERT INTO "tokens_recuperacion" VALUES(3,6,'$2b$12$vmx0pb0DWbmj0PH2tXeyfeWpNH8fyK4y7YV4GBmhple./AWcKRoMm','2026-09-19 15:24:08.523056',1,0,'2026-09-19 15:09:08.524200');
INSERT INTO "tokens_recuperacion" VALUES(4,6,'$2b$12$2HkbIY6nN8qj0TRNk3bs/ez5dGX3IscPgzN/yK47N07NYMK98Achm','2026-09-19 15:32:22.566593',1,0,'2026-09-19 15:17:22.567784');
INSERT INTO "tokens_recuperacion" VALUES(5,6,'$2b$12$prt08VlnELkrPDC4PNlyieIPyxm16zLE5nIX1DiH14XPHUqhswst2','2026-09-19 15:55:06.204937',1,0,'2026-09-19 15:40:06.206664');
INSERT INTO "tokens_recuperacion" VALUES(6,6,'$2b$12$8QTFSElkflvtZcToopxuweeiv/3Fp3ucqD5UMUACDDaP6xcdZdpS6','2026-09-19 16:20:31.871517',1,0,'2026-09-19 16:05:31.877666');
INSERT INTO "tokens_recuperacion" VALUES(7,6,'$2b$12$FPIfCXfymJBumsGDchpRauRNJSp3CA/CR9ckddUGbhXzD19DZelna','2026-09-19 17:11:55.860199',1,0,'2026-09-19 16:56:55.862501');
INSERT INTO "tokens_recuperacion" VALUES(8,6,'$2b$12$T4/4aDavOy29FeFvnh6bi.KuvKW9Do0D8nCd6PpKrYnnHbW8bSLxe','2026-09-19 17:59:54.519200',1,0,'2026-09-19 17:44:54.520566');
INSERT INTO "tokens_recuperacion" VALUES(9,6,'$2b$12$EcEgfglhLb4lkz/FSwKIz.hUIy3D7s4eRsBZ26XpucWmL8nXp4I2G','2026-09-19 19:12:04.760999',1,0,'2026-09-19 18:57:04.762421');
INSERT INTO "tokens_recuperacion" VALUES(10,6,'$2b$12$lJ3FYMPkyW.bpMz8FzJC6.eTw4R7jdC32Nh9UnFPq77reMlkIPPQW','2026-09-19 19:41:48.772852',1,0,'2026-09-19 19:26:48.775049');
INSERT INTO "tokens_recuperacion" VALUES(11,6,'$2b$12$F9o6Rx.jQDcgvhDsuQ8/i.aw3ZlgZlFF7eyrpNBgPuB1soxUKNB8a','2026-09-19 20:06:15.189505',1,0,'2026-09-19 19:51:15.190782');
INSERT INTO "tokens_recuperacion" VALUES(12,6,'$2b$12$N5G92Q9sgR1rBveN62qXo.ce2dMt4eAFRs8vSIHFKbP7F0sT1Gzx6','2026-09-19 20:16:07.882424',1,0,'2026-09-19 20:01:07.883755');
INSERT INTO "tokens_recuperacion" VALUES(13,6,'$2b$12$.avPmQNXcYcWCTv.3hZnJ.gxENYMQY1N553ZD.Jdg8SIfBOjbJ2DW','2026-09-19 20:42:33.205415',1,0,'2026-09-19 20:27:33.206555');
INSERT INTO "tokens_recuperacion" VALUES(14,6,'$2b$12$kHcuhpsZ.g67FTzytFbcTOKTizCByAUrk8/sWwDR8ogKdAo18Mfs6','2026-09-20 17:16:05.827468',1,0,'2026-09-20 17:01:05.828762');
INSERT INTO "tokens_recuperacion" VALUES(15,6,'$2b$12$MXaPAfMx6NDjznvzLn9ckeoiOt0dCem.1ehG/snF5Y/EebEnNlrLq','2026-09-20 19:19:52.132376',1,0,'2026-09-20 19:04:52.134297');
INSERT INTO "tokens_recuperacion" VALUES(16,6,'$2b$12$CqdxF9qb2MmaxgltPStpL.nBEG3NtzcpcJLchtMqLWpiGrymMStIW','2026-09-20 21:21:54.000858',1,0,'2026-09-20 21:06:54.002679');
INSERT INTO "tokens_recuperacion" VALUES(17,6,'$2b$12$591G/S/kwgH5qFwEF9j/lOckc1iYMMurJRMTRtlhTJClVcSFfEX2C','2026-09-20 21:57:44.552943',1,0,'2026-09-20 21:42:44.557854');
INSERT INTO "tokens_recuperacion" VALUES(18,8,'$2b$12$qjXCflm0oID.0zEqeRxJUeLx3SEJJfQSMEzJu965x0sC/tJivyfpC','2026-09-20 22:16:38.780959',1,0,'2026-09-20 22:01:38.782769');
INSERT INTO "tokens_recuperacion" VALUES(19,12,'$2b$12$nVCaKFsMhljwXQBlVcBFaObFt/EiVVsLtHNweZLV0XhGgAlol1gZy','2026-09-20 22:22:58.424800',1,0,'2026-09-20 22:07:58.427055');
INSERT INTO "tokens_recuperacion" VALUES(20,8,'$2b$12$oWWLbDixKWrqo.YzFFiUjOc5sCeZSC2LDVrXeA06p8C7yf3D3YuK2','2026-09-20 22:40:00.204584',1,0,'2026-09-20 22:25:00.205241');
INSERT INTO "tokens_recuperacion" VALUES(21,6,'$2b$12$5YT9p.ON2VuwxanGH8I.qOpVOCxE5C6VTDgNgDLJdCytTD0DCRpaS','2026-09-20 22:52:45.664869',1,0,'2026-09-20 22:37:45.667088');
INSERT INTO "tokens_recuperacion" VALUES(22,6,'$2b$12$nzWCto5b7KI5ECRawhq2SeQy5AxDNdy7vBCE4C89oBppP3DUotObW','2026-09-20 23:11:59.515480',1,0,'2026-09-20 22:56:59.517399');
INSERT INTO "tokens_recuperacion" VALUES(23,6,'$2b$12$SKO6VgASpCmyofoKmXjP0uItgrhqNKmb8QKNh23Sx7dDUUM1RgmAq','2026-09-20 23:23:30.644638',1,0,'2026-09-20 23:08:30.646970');
INSERT INTO "tokens_recuperacion" VALUES(24,6,'$2b$12$jo.QHlRzMGVThFpAuEWnY.eClhePgY4sYklLhuWU2og/NEIWuE/1a','2026-09-20 23:45:17.828444',1,0,'2026-09-20 23:30:17.829965');
INSERT INTO "tokens_recuperacion" VALUES(25,6,'$2b$12$OVST.wq11.MjCkPc74Syo.OE8IP2W0qzrpUJFgDeQtKqlYQrnEkmq','2026-09-21 16:28:50.735467',1,0,'2026-09-21 16:13:50.736848');
INSERT INTO "tokens_recuperacion" VALUES(26,6,'$2b$12$uRB.9ckNB4Al06fTrp0NkODZO3vgwo8zX92fcL9GMPrpxPlxUGMrW','2026-09-21 16:57:46.311409',1,0,'2026-09-21 16:42:46.313513');
INSERT INTO "tokens_recuperacion" VALUES(27,6,'$2b$12$Miaqc3MfSE4SRXvu.qj3JO9S8cL7XWJwmV/P55LM5m6MizvTbF5IS','2026-09-21 17:07:35.220662',1,0,'2026-09-21 16:52:35.223237');
INSERT INTO "tokens_recuperacion" VALUES(28,6,'$2b$12$i8oUnpynPTPCw0qbZDrFZ.fivYyxXZy.bmBnoNOUFIZjO8YpcbTzC','2026-09-21 17:23:32.948528',1,0,'2026-09-21 17:08:32.950175');
INSERT INTO "tokens_recuperacion" VALUES(29,6,'$2b$12$DjnSLWfNkPxhn/e.QJZNWeWUv6teDOgA3zXmN9cVD2YcO9oCqKqLG','2026-09-21 17:24:51.297433',1,0,'2026-09-21 17:09:51.300754');
INSERT INTO "tokens_recuperacion" VALUES(30,6,'$2b$12$YkwsG7/ICb94glRk2hAPJexIlNdZzAfuHnzH2YZq7ZjcTwXVbXEa2','2026-09-21 17:39:38.565394',1,0,'2026-09-21 17:24:38.566767');
INSERT INTO "tokens_recuperacion" VALUES(31,12,'$2b$12$EYGPOGcrqjy/4rDY2.pJruD94ZgWzLFwYLVwYOPsD18NSxBG91SFS','2026-09-21 18:20:36.266396',1,0,'2026-09-21 18:05:36.268878');
INSERT INTO "tokens_recuperacion" VALUES(32,10,'$2b$12$ZkFu7yT5ZC7iTh9deACRdu4eKIbJRnSQOtpXU7Hoql9mhD0P6fGNe','2026-09-21 18:22:27.486017',1,0,'2026-09-21 18:07:27.486739');
CREATE TABLE transacciones_pago (
	id_transaccion INTEGER NOT NULL, 
	id_orden INTEGER NOT NULL, 
	pasarela VARCHAR(50) NOT NULL, 
	payment_intent_id VARCHAR(150) NOT NULL, 
	monto NUMERIC(10, 2) NOT NULL, 
	moneda VARCHAR(10) NOT NULL, 
	estado VARCHAR(30) NOT NULL, 
	metodo_pago VARCHAR(50) NOT NULL, 
	marca_tarjeta VARCHAR(50), 
	ultimos4 VARCHAR(4), 
	detalles_raw TEXT, 
	fecha_creacion DATETIME, 
	PRIMARY KEY (id_transaccion), 
	FOREIGN KEY(id_orden) REFERENCES ordenes_venta (id_orden) ON DELETE CASCADE
);
INSERT INTO "transacciones_pago" VALUES(1,1,'STRIPE','pi_3UHuW51HD8WYieY51gCFrKBx',676,'BOB','SUCCEEDED','card','card','4242','{"id": "pi_3UHuW51HD8WYieY51gCFrKBx", "status": "succeeded", "currency": "bob"}','2026-09-20 23:52:12.731755');
INSERT INTO "transacciones_pago" VALUES(2,45,'STRIPE','pi_3UIFA31HD8WYieY51U0hgzMh',294.5,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIFA31HD8WYieY51U0hgzMh", "status": "succeeded", "currency": "bob"}','2026-09-21 21:54:10.370029');
INSERT INTO "transacciones_pago" VALUES(3,44,'STRIPE','pi_3UIFB01HD8WYieY50YZIYqKS',437,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIFB01HD8WYieY50YZIYqKS", "status": "succeeded", "currency": "bob"}','2026-09-21 21:55:09.723176');
INSERT INTO "transacciones_pago" VALUES(4,43,'STRIPE','pi_3UIFBV1HD8WYieY51iFvFTCX',462,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIFBV1HD8WYieY51iFvFTCX", "status": "succeeded", "currency": "bob"}','2026-09-21 21:55:39.896355');
INSERT INTO "transacciones_pago" VALUES(5,42,'STRIPE','pi_3UIFC81HD8WYieY50mJRF3h3',1051,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIFC81HD8WYieY50mJRF3h3", "status": "succeeded", "currency": "bob"}','2026-09-21 21:56:19.066102');
INSERT INTO "transacciones_pago" VALUES(6,46,'STRIPE','pi_3UIFJb1HD8WYieY50UQFN4uV',319.5,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIFJb1HD8WYieY50UQFN4uV", "status": "succeeded", "currency": "bob"}','2026-09-21 22:04:16.272921');
INSERT INTO "transacciones_pago" VALUES(7,47,'STRIPE','pi_3UIG0M1HD8WYieY51kAUI30g',956,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIG0M1HD8WYieY51kAUI30g", "status": "succeeded", "currency": "bob"}','2026-09-21 22:48:23.733235');
INSERT INTO "transacciones_pago" VALUES(8,48,'STRIPE','pi_3UIHiR1HD8WYieY50sKThQQ5',341,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIHiR1HD8WYieY50sKThQQ5", "status": "succeeded", "currency": "bob"}','2026-09-22 00:37:53.977308');
INSERT INTO "transacciones_pago" VALUES(9,49,'STRIPE','pi_3UIHjQ1HD8WYieY50mN4kH2K',269.5,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIHjQ1HD8WYieY50mN4kH2K", "status": "succeeded", "currency": "bob"}','2026-09-22 00:38:50.992729');
INSERT INTO "transacciones_pago" VALUES(10,50,'STRIPE','pi_3UIHy71HD8WYieY516ElNGG9',269.5,'BOB','SUCCEEDED','card','visa','4242','{"id": "pi_3UIHy71HD8WYieY516ElNGG9", "status": "succeeded", "currency": "bob"}','2026-09-22 00:54:04.173222');
CREATE TABLE usuarios (
	id_usuario INTEGER NOT NULL, 
	id_sucursal INTEGER, 
	nombres VARCHAR(100) NOT NULL, 
	apellidos VARCHAR(100) NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	password_hash VARCHAR(120) NOT NULL, 
	telefono VARCHAR(30), 
	rol VARCHAR(30) NOT NULL, 
	estado_cuenta VARCHAR(30) NOT NULL, 
	intentos_fallidos INTEGER NOT NULL, 
	bloqueado_hasta DATETIME, 
	ultimo_acceso DATETIME, 
	creado_en DATETIME, 
	PRIMARY KEY (id_usuario), 
	FOREIGN KEY(id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE SET NULL
);
INSERT INTO "usuarios" VALUES(1,NULL,'Alberto','Delgado','alberto.delgado@store.bo','$2b$12$fTjkJuRrWN6BujywvaUnmev50JMdGabR8KvOy0jpXX1sWlZZdRED.',NULL,'ADMINISTRADOR','ACTIVO',0,NULL,'2026-09-21 17:24:44.333311','2026-09-18 18:41:51.562438');
INSERT INTO "usuarios" VALUES(2,NULL,'Andy','Mujica','andy.mujica@store.bo','$2b$12$fTjkJuRrWN6BujywvaUnmev50JMdGabR8KvOy0jpXX1sWlZZdRED.',NULL,'ADMINISTRADOR','ACTIVO',0,NULL,'2026-09-21 14:39:21.714275','2026-09-18 18:41:51.562448');
INSERT INTO "usuarios" VALUES(3,1,'Carlos','Morales','carlos.morales@store.bo','$2b$12$fTjkJuRrWN6BujywvaUnmev50JMdGabR8KvOy0jpXX1sWlZZdRED.',NULL,'ENCARGADO_SUCURSAL','ACTIVO',0,NULL,NULL,'2026-09-18 18:41:51.562451');
INSERT INTO "usuarios" VALUES(4,1,'Javier','Roca','javier.roca@store.bo','$2b$12$fTjkJuRrWN6BujywvaUnmev50JMdGabR8KvOy0jpXX1sWlZZdRED.',NULL,'CAJERO','BLOQUEADO_POR_INTENTOS',5,NULL,'2026-09-21 17:24:41.652662','2026-09-18 18:41:51.562454');
INSERT INTO "usuarios" VALUES(5,NULL,'Mateo','Suarez','mateo.logistica@store.bo','$2b$12$fTjkJuRrWN6BujywvaUnmev50JMdGabR8KvOy0jpXX1sWlZZdRED.',NULL,'LOGISTICA','ACTIVO',0,NULL,'2026-09-20 21:36:41.878724','2026-09-18 18:41:51.562456');
INSERT INTO "usuarios" VALUES(6,NULL,'Rodrigo','Paz','rodrigo.cliente@gmail.com','$2b$12$r./8j6qZny/rqEpYORxUtu5kiRBa34EY6xmcNFHEEW80eqchlY.rW',NULL,'CLIENTE','ACTIVO',0,NULL,'2026-09-21 20:13:44.859351','2026-09-18 18:41:51.562458');
INSERT INTO "usuarios" VALUES(7,NULL,'Prueba','Bloqueo','test.bloqueo@store.bo','$2b$12$AVh8BCshUBkrpjwiyaZyIOWMbWiTZUNFYvDa0bXLnYNABBZml6KIG',NULL,'CLIENTE','BLOQUEADO_POR_INTENTOS',5,'2026-09-21 17:54:37.583604',NULL,'2026-09-19 15:04:26.523718');
INSERT INTO "usuarios" VALUES(8,NULL,'Andy','Mauricio Mujica Vallejos','mujicamauricio412@gmail.com','$2b$12$YkAeqM1OZ7sEJFvCdagFveDUpuOhbyP8aQe6i0FL7qzKnw1vwufAi','77838805','CLIENTE','ACTIVO',0,NULL,'2026-09-20 22:40:49.814902','2026-09-19 15:39:31.999169');
INSERT INTO "usuarios" VALUES(9,NULL,'Test','Cliente','testcliente99@gmail.com','$2b$12$Z1NrGd3fljq9/PwAVTtkcujBEnmetxKDBEvHy4WYF1mSwZRVyMWqa',NULL,'CLIENTE','ACTIVO',0,NULL,'2026-09-19 15:48:36.693262','2026-09-19 15:48:36.694156');
INSERT INTO "usuarios" VALUES(10,NULL,'Andy','Vallejos','auxiliaturans@gmail.com','$2b$12$8gkfOzWiJVIviF4j3cHvIuvMSTrQsQZFGxJNeCcVSMh09sUFCtkGu',NULL,'CLIENTE','ACTIVO',0,NULL,'2026-09-21 18:08:33.530947','2026-09-20 21:45:13.298705');
INSERT INTO "usuarios" VALUES(11,NULL,'Mauricio','Mujica','cliente.test.1789941033@gmail.com','$2b$12$8vu0PBt2k.9Up74u1gVmHuDHaSx75yxLHKL64ennjr2ZQ/giRWMfW',NULL,'CLIENTE','ACTIVO',0,NULL,'2026-09-20 21:50:34.378670','2026-09-20 21:50:34.381525');
INSERT INTO "usuarios" VALUES(12,NULL,'Andy','Vallejos','olachatgpt229@gmail.com','$2b$12$Ph.Z1hwsVBAcfCXDqKDFK..n/cmac5s3s3WWxAPKb81mRV.20P9J2',NULL,'CLIENTE','ACTIVO',0,NULL,'2026-09-20 22:09:41.915580','2026-09-20 21:57:49.386341');
INSERT INTO "usuarios" VALUES(13,NULL,'Vito','Carne','calculo360@gmail.com','$2b$12$UJz1/NulQ9SxdXd9z7BffO9ypNa0fWwQKhW8Nv0C5eI9tfNan2zsO','77838805','CLIENTE','ACTIVO',0,NULL,'2026-09-21 18:10:11.652691','2026-09-21 18:10:11.656112');
CREATE INDEX ix_ciudades_id_ciudad ON ciudades (id_ciudad);
CREATE UNIQUE INDEX ix_proveedores_nit_identificacion ON proveedores (nit_identificacion);
CREATE INDEX ix_proveedores_id_proveedor ON proveedores (id_proveedor);
CREATE UNIQUE INDEX ix_temporadas_codigo_campana ON temporadas (codigo_campana);
CREATE INDEX ix_temporadas_id_temporada ON temporadas (id_temporada);
CREATE INDEX ix_categorias_id_categoria ON categorias (id_categoria);
CREATE INDEX ix_marcas_id_marca ON marcas (id_marca);
CREATE INDEX ix_sucursales_id_sucursal ON sucursales (id_sucursal);
CREATE UNIQUE INDEX ix_productos_codigo_sku_base ON productos (codigo_sku_base);
CREATE INDEX ix_productos_id_producto ON productos (id_producto);
CREATE UNIQUE INDEX ix_usuarios_email ON usuarios (email);
CREATE INDEX ix_usuarios_id_usuario ON usuarios (id_usuario);
CREATE INDEX ix_producto_colores_id_color ON producto_colores (id_color);
CREATE INDEX ix_producto_tallas_id_talla ON producto_tallas (id_talla);
CREATE INDEX ix_inventario_id_inventario ON inventario (id_inventario);
CREATE INDEX ix_tokens_recuperacion_id_token ON tokens_recuperacion (id_token);
CREATE INDEX ix_bitacora_accesos_id_bitacora ON bitacora_accesos (id_bitacora);
CREATE INDEX ix_kardex_movimientos_id_movimiento ON kardex_movimientos (id_movimiento);
CREATE INDEX ix_reservas_id_reserva ON reservas (id_reserva);
CREATE INDEX ix_carritos_id_carrito ON carritos (id_carrito);
CREATE INDEX ix_carritos_id_usuario ON carritos (id_usuario);
CREATE INDEX ix_ordenes_venta_id_usuario ON ordenes_venta (id_usuario);
CREATE INDEX ix_ordenes_venta_id_orden ON ordenes_venta (id_orden);
CREATE UNIQUE INDEX ix_metodos_pago_codigo ON metodos_pago (codigo);
CREATE INDEX ix_metodos_pago_id_metodo ON metodos_pago (id_metodo);
CREATE INDEX ix_reserva_detalles_id_reserva_detalle ON reserva_detalles (id_reserva_detalle);
CREATE INDEX ix_carrito_items_id_item ON carrito_items (id_item);
CREATE INDEX ix_carrito_items_id_carrito ON carrito_items (id_carrito);
CREATE INDEX ix_ordenes_detalle_id_orden ON ordenes_detalle (id_orden);
CREATE INDEX ix_ordenes_detalle_id_detalle_orden ON ordenes_detalle (id_detalle_orden);
CREATE UNIQUE INDEX ix_transacciones_pago_payment_intent_id ON transacciones_pago (payment_intent_id);
CREATE INDEX ix_transacciones_pago_id_orden ON transacciones_pago (id_orden);
CREATE INDEX ix_transacciones_pago_id_transaccion ON transacciones_pago (id_transaccion);
CREATE INDEX ix_gamificacion_perfiles_id_perfil ON gamificacion_perfiles (id_perfil);
CREATE INDEX ix_recompensas_catalogo_id_recompensa ON recompensas_catalogo (id_recompensa);
CREATE INDEX ix_cupones_fidelizacion_id_cupon ON cupones_fidelizacion (id_cupon);
CREATE INDEX ix_bitacora_auditoria_id_auditoria ON bitacora_auditoria (id_auditoria);
CREATE INDEX ix_devoluciones_id_devolucion ON devoluciones (id_devolucion);
CREATE INDEX ix_devoluciones_nro_ticket_original ON devoluciones (nro_ticket_original);
CREATE UNIQUE INDEX ix_devoluciones_nro_devolucion ON devoluciones (nro_devolucion);
CREATE INDEX ix_devolucion_detalles_id_detalle_devolucion ON devolucion_detalles (id_detalle_devolucion);

COMMIT;
PRAGMA foreign_keys = ON;
