import {useStaticQuery, graphql} from 'gatsby';

const useLastMonth = () => {
  const data = useStaticQuery (
    graphql`{
  allDataJson {
    edges {
      node {
        iso: last_month(formatString: "YYYY-MM-DD")
        iso_mid: last_month(formatString: "YYYY-MM-15")
        year: last_month(formatString: "YYYY")
        month: last_month(formatString: "MM")
        month_long_es: last_month(formatString: "MMMM", locale: "es")
        month_short_es: last_month(formatString: "MMM", locale: "es")
        month_long_en: last_month(formatString: "MMMM", locale: "en")
        month_short_en: last_month(formatString: "MMM", locale: "en")
        is6o: last_month6(formatString: "YYYY-MM-DD")
        iso_mid6: last_month6(formatString: "YYYY-MM-15")
        year6: last_month6(formatString: "YYYY")
        month6: last_month6(formatString: "MM")
        month_long_es6: last_month6(formatString: "MMMM", locale: "es")
        month_short_es6: last_month6(formatString: "MMM", locale: "es")
        month_long_en6: last_month6(formatString: "MMMM", locale: "en")
        month_short_en6: last_month6(formatString: "MMM", locale: "en")
      }
    }
  }
}

`
  );
  return data.allDataJson.edges[0].node;
};

// const sub6Months = (date) => {
//   var d = new Date(date);
//   d = d.setMonth(d.getMonth() - 6);
//   return d.toISOString().substring(0, 10);
// };

export default useLastMonth;
// const Header = () => {
//   const { title } = useLastMonth()
//   return (
//     <header>
//       <h1>{title}</h1>
//     </header>
//   )
// }
