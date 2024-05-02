import {useStaticQuery, graphql} from 'gatsby';

const useInfographics = () => {
  const data = useStaticQuery (
    graphql`{
    allFile(filter: {name: {regex: "/(^municipios_.*20[2-9][2-9]|^infographic_.*20[2-9][2-9])/"}}) {
      edges {
        node {
          childImageSharp {
            fluid(maxWidth: 432) {
              ...GatsbyImageSharpFluid_noBase64
              originalName
            }
          }
          base
          id
        }
      }
    }
  }
`
  );
  return data;
};

// const sub6Months = (date) => {
//   var d = new Date(date);
//   d = d.setMonth(d.getMonth() - 6);
//   return d.toISOString().substring(0, 10);
// };

export default useInfographics;