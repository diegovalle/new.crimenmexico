sql_query_hom <- "
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
    NATURAL JOIN tipo_municipios  
    NATURAL JOIN municipio_names  
    NATURAL JOIN population_municipios
    WHERE ( 
      (modalidad_text = 'HOMICIDIOS' AND tipo_text = 'DOLOSOS')
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
WHERE (modalidad_text = 'HOMICIDIOS' AND tipo_text = 'DOLOSOS')
"

sql_query_sec <- "
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
NATURAL JOIN tipo_municipios  
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(tipo_text = 'SECUESTRO')
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
WHERE (tipo_text = 'SECUESTRO')
"

sql_query_ext <- "
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
NATURAL JOIN tipo_municipios  
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(tipo_text = 'EXTORSION') 
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
WHERE (tipo_text = 'EXTORSION') 
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
NATURAL JOIN tipo_municipios  
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(tipo_text = 'VIOLACION') 
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
WHERE (tipo_text = 'VIOLACION') 
"

sql_query_rvsv <- "
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
NATURAL JOIN tipo_municipios  
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(tipo_text ='SIN VIOLENCIA' AND subtipo_text = 'DE VEHICULOS')  
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
WHERE (tipo_text ='SIN VIOLENCIA' AND subtipo_text = 'DE VEHICULOS')  
"

sql_query_rvcv <- "
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
NATURAL JOIN tipo_municipios   
NATURAL JOIN subtipo_municipios 
NATURAL JOIN municipio_names  
NATURAL JOIN population_municipios
WHERE ( 
(tipo_text ='CON VIOLENCIA' AND subtipo_text = 'DE VEHICULOS')
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
WHERE (tipo_text ='CON VIOLENCIA' AND subtipo_text = 'DE VEHICULOS')
"