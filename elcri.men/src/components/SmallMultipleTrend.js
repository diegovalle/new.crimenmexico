import React from 'react';
import {timeFormatDefaultLocale} from 'd3-time-format';
import {useIntl} from 'react-intl';
import {dateLoc} from '../../src/i18n';
import LazyLoad from 'react-lazyload';

import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
import {LineChart, ScatterChart} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
} from 'echarts/components';
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers';

import '../assets/css/trends.css';

echarts.use ([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  ScatterChart,
  CanvasRenderer,
]);

function SmallMultipleTrend (props) {
  const {
    min_y = 0,
    col_class = 'col-3',
    height = 170,
    backgroundClass = 'line-chart-brown',
    ...restProps
  } = props;

  const intl = useIntl ();
  let l;
  intl.locale === 'es' ? (l = timeFormatDefaultLocale (dateLoc.es_MX)) : null;
  let data = props.formatData (props.data);

  let chartOption = {
    animation: false,
    title: {
      text: Object.keys (props.data)[0],
      left: 'center',
      textStyle: {
        fontSize: 30,
        fontFamily: 'Roboto Condensed',
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        animation: false,
        label: {
          backgroundColor: '#ccc',
          borderColor: '#aaa',
          borderWidth: .1,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          color: '#111',
          fontFamily: 'Roboto Condensed',
        },
      },
      formatter: function(item) {
        let date = new Date(item.name)
        let datestr = [
            date.toLocaleString(intl.locale , { month: 'long' }),
            date.getFullYear (),
          ].join(' ')
        let tasa = intl.formatMessage ({id: 'tasa anualizada'})
        return `${datestr}<br/>${tasa}: <b>${item.value}</b>`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data[0].map (function (item) {
        return item.date;
      }),
      axisLabel: {
        interval: 35,
        formatter: function (value, idx) {
          var date = new Date (value);
          return [
            date.toLocaleString(intl.locale , { month: 'short' }),
            date.getFullYear (),
          ].join ('\n');
        },
      },
      boundaryGap: false,
      splitNumber: 2,
    },
    yAxis: [
      {
        name: intl.formatMessage ({id: 'tasa anualizada'}),
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {fontFamily: 'Roboto Condensed'},
        type: 'value',
        scale: false,
        splitNumber: 3,
        interval: Math.round (
          Math.round (((props.max_y + 5) / 10) * 10 / 3) / 10
        ) * 10,
        max: Math.round ((props.max_y + 5) / 10) * 10,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
          },
        },
      },
    ],
    series: [
      {
        type: 'scatter',
        data: data[1].map (function (item) {
          return item.value;
        }),
        itemStyle: {
          color: 'black',
          opacity: .7
        },
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        z: 1000
      },
      {
        name: 'L',
        type: 'line',
        data: data[0].map (function (item) {
          return item.l;
        }),
        lineStyle: {
          opacity: 0,
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'U',
        type: 'line',
        data: data[0].map (function (item) {
          return item.u - item.l;
        }),
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: '#777',
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'median',
        type: 'line',
        data: data[0].map (function (item) {
          return item.value;
        }),
        itemStyle: {
          color: '#333',
        },
        lineStyle: {
          width: 2.5,
          color: props.data.trend[0] === 'positive'
            ? '#ef3b2c'
            : props.data.trend[0] === 'negative' ? '#225ea8' : '#252525',
        },
        showSymbol: false,
      },
    ],
  };

  return (
    <div className="col-3" style={{marginBottom: '15px'}}>
      <div
        style={{width: '100%', borderRadius: '5px'}}
        className="line-chart"
        id={'line' + Object.keys (props.data)[0].replace (/ |\.|,/g, '')}
      >
        <LazyLoad height={height} once offset={200}>
          <ReactEChartsCore
            echarts={echarts}
            option={chartOption}
            style={{height: 300, width: '100%'}}
            opts={{locale : echarts. registerLocale ('ES')}}
          />
        </LazyLoad>
      </div>
    </div>
  );
}

export default SmallMultipleTrend;
