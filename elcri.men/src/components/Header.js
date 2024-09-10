import React from 'react'

import usflag from '../assets/images/us.png'

class Header extends React.Component {
  render() {
    return (
      
        <div id="header-wrapper" className="wrapper" style={{borderBottom: "2px solid #e5e5e5"}}>
          <div id="header">
            <a href="#" id="logo">
              <h1>Crimen en México</h1>
              <h2>Reporte mensual de la delincuencia en México</h2>
            </a>

            <nav id="nav">
              <ul>
                <li className="current_page_item">
                  <a href="/">Inicio</a>
                </li>

                <li>
                  <a href="#">Estados</a>
                  <ul>
                    <li>
                      <a href="/es/states.html">Series de Tiempo</a>
                    </li>
                    <li>
                      <a href="/es/estados-mujeres.html">
                        Homicidios de Mujeres
                      </a>
                    </li>
                    <li>
                      <a href="/es/estados-feminicidio.html">Feminicidios</a>
                    </li>
                    <li>
                      <a href="/es/ENVIPE.html">Subregistro de Delitos</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#">Municipios</a>
                  <ul>
                    <li>
                      <a href="/es/municipios-map.html">Mapa</a>
                    </li>
                    <li>
                      <a href="/es/municipios.html">Series de Tiempo</a>
                    </li>
                    <li>
                      <a href="/es/municipios-mas-violentos.html">Top 50</a>
                    </li>
                    <li>
                      <a href="/es/lisa-map.html">Mapa de clusters</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="/es/anomalies.html">Anomalías</a>
                </li>
                <li>
                  <a href="/es/infographics.html">Infográficas</a>
                </li>
                <li>
                  <a href="/es/datos.html">Datos</a>
                </li>
                <li style={{ whiteSpace: 'nowrap' }}>
                  <a href="/en/">
                    <img width="24" height="16" src={usflag} alt="US Flag" />
                    En
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
     
    )
  }
}

export default Header
