sql_query_hom <- "
SELECT t1.state_code  AS state_code, 
       state, 
t1.mun_code    AS mun_code, 
municipio, 
tipo_text      AS tipo, 
subtipo_text   AS subtipo, 
modalidad_text AS modalidad, 
date, 
count, 
population 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios t1 
INNER JOIN (SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count)                           AS count, 
municipio, 
--sum(population) / count(population),   
( Sum(count) / population ) * 100000 AS rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'HOMICIDIO DOLOSO' 
OR 
subtipo_text = 'FEMINICIDIO' ) 
AND ( date >= (SELECT substr(date((SELECT max(date) FROM municipios_fuero_comun) || '-01' ,'start of month', '-5 months'), 1, 7) ) )
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35) 
UNION 
SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count) 
AS count, 
municipio, 
--sum(population) / count(population),   
( ( Sum(count) * 12 ) / ( 
Sum(population) / Count( 
population) ) 
) 
* 
100000 AS 
rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'HOMICIDIO DOLOSO' 
OR 
subtipo_text = 'FEMINICIDIO' ) 
AND ( date = (SELECT Max(date) 
FROM   municipios_fuero_comun) 
) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  50)) t2 
ON t1.state_code = t2.state_code 
AND t1.mun_code = t2.mun_code 
WHERE  ( subtipo_text = 'HOMICIDIO DOLOSO' 
OR subtipo_text = 'FEMINICIDIO' ) 
"

sql_query_sec <- "
SELECT t1.state_code  AS state_code, 
       state, 
t1.mun_code    AS mun_code, 
municipio, 
tipo_text      AS tipo, 
subtipo_text   AS subtipo, 
modalidad_text AS modalidad, 
date, 
count, 
population 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios t1 
INNER JOIN (SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count)                           AS count, 
municipio, 
--sum(population) / count(population),   
( Sum(count) / population ) * 100000 AS rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'SECUESTRO'  ) 
AND ( date >= (SELECT substr(date((SELECT max(date) FROM municipios_fuero_comun) || '-01' ,'start of month', '-5 months'), 1, 7)
) ) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35) 
UNION 
SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count) 
AS count, 
municipio, 
--sum(population) / count(population),   
( ( Sum(count) * 12 ) / ( 
Sum(population) / Count( 
population) ) 
) 
* 
100000 AS 
rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'SECUESTRO' ) 
AND ( date = (SELECT Max(date) 
FROM   municipios_fuero_comun) 
) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35)) t2 
ON t1.state_code = t2.state_code 
AND t1.mun_code = t2.mun_code 
WHERE  ( subtipo_text = 'SECUESTRO'  ) 
"

sql_query_ext <- "
SELECT t1.state_code  AS state_code, 
       state, 
t1.mun_code    AS mun_code, 
municipio, 
tipo_text      AS tipo, 
subtipo_text   AS subtipo, 
modalidad_text AS modalidad, 
date, 
count, 
population 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios t1 
INNER JOIN (SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count)                           AS count, 
municipio, 
--sum(population) / count(population),   
( Sum(count) / population ) * 100000 AS rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'EXTORSIÓN'  ) 
AND ( date >= (SELECT substr(date((SELECT max(date) FROM municipios_fuero_comun) || '-01' ,'start of month', '-5 months'), 1, 7)
) ) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35) 
UNION 
SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count) 
AS count, 
municipio, 
--sum(population) / count(population),   
( ( Sum(count) * 12 ) / ( 
Sum(population) / Count( 
population) ) 
) 
* 
100000 AS 
rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( subtipo_text = 'EXTORSIÓN' ) 
AND ( date = (SELECT Max(date) 
FROM   municipios_fuero_comun) 
) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35)) t2 
ON t1.state_code = t2.state_code 
AND t1.mun_code = t2.mun_code 
WHERE  ( subtipo_text = 'EXTORSIÓN'  ) 
"


sql_query_viol <- "
SELECT t1.state_code as state_code, state, 
t1.mun_code as mun_code, municipio, 
tipo_text as tipo, subtipo_text as subtipo, modalidad_text as modalidad,
date, count, population 
FROM municipios_fuero_comun
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios  
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios t1
INNER JOIN (
SELECT state_code, mun_code FROM (
SELECT state_code, mun_code, sum(count) as count, municipio,
population, (sum(count) / population)  * 100000 as rate
FROM municipios_fuero_comun 
NATURAL JOIN modalidad_municipios
NATURAL JOIN subtipo_municipios  
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(subtipo_text = 'VIOLACION') 
AND 
(date >= date('now', 'start of month', '-13 months'))
)
GROUP BY state_code, mun_code
)
WHERE population > 50000
ORDER BY rate DESC
LIMIT 50
) t2 
ON t1.state_code = t2.state_code and t1.mun_code = t2.mun_code
WHERE (subtipo_text = 'VIOLACION') 
"

sql_query_rvsv <- "
SELECT t1.state_code  AS state_code, 
       state, 
t1.mun_code    AS mun_code, 
municipio, 
tipo_text      AS tipo, 
'SIN VIOLENCIA'   AS subtipo, 
modalidad_text AS modalidad, 
date, 
count, 
population 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios t1 
INNER JOIN (SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count)                           AS count, 
municipio, 
--sum(population) / count(population),   
( Sum(count) / population ) * 100000 AS rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA' ) 
AND ( date >= (SELECT substr(date((SELECT max(date) FROM municipios_fuero_comun) || '-01' ,'start of month', '-5 months'), 1, 7)
) ) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35) 
UNION 
SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count) 
AS count, 
municipio, 
--sum(population) / count(population),   
( ( Sum(count) * 12 ) / ( 
Sum(population) / Count( 
population) ) 
) 
* 
100000 AS 
rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA') 
AND ( date = (SELECT Max(date) 
FROM   municipios_fuero_comun) 
) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35)) t2 
ON t1.state_code = t2.state_code 
AND t1.mun_code = t2.mun_code 
WHERE  ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS SIN VIOLENCIA'  ) "

sql_query_rvcv <- "
SELECT t1.state_code  AS state_code, 
       state, 
t1.mun_code    AS mun_code, 
municipio, 
tipo_text      AS tipo, 
'CON VIOLENCIA'   AS subtipo, 
modalidad_text AS modalidad, 
date, 
count, 
population 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN tipo_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN state_names 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios t1 
INNER JOIN (SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count)                           AS count, 
municipio, 
--sum(population) / count(population),   
( Sum(count) / population ) * 100000 AS rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA'  ) 
AND ( date >= (SELECT substr(date((SELECT max(date) FROM municipios_fuero_comun) || '-01' ,'start of month', '-5 months'), 1, 7)
) ) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35) 
UNION 
SELECT state_code, 
mun_code 
FROM   (SELECT state_code, 
mun_code, 
Sum(count) 
AS count, 
municipio, 
--sum(population) / count(population),   
( ( Sum(count) * 12 ) / ( 
Sum(population) / Count( 
population) ) 
) 
* 
100000 AS 
rate 
FROM   municipios_fuero_comun 
NATURAL JOIN modalidad_municipios 
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names 
NATURAL JOIN population_municipios 
WHERE  ( ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA') 
AND ( date = (SELECT Max(date) 
FROM   municipios_fuero_comun) 
) 
AND population > 100000 ) 
GROUP  BY state_code, 
mun_code 
ORDER  BY rate DESC 
LIMIT  35)) t2 
ON t1.state_code = t2.state_code 
AND t1.mun_code = t2.mun_code 
WHERE  ( modalidad_text = 'ROBO DE COCHE DE 4 RUEDAS CON VIOLENCIA'  ) "