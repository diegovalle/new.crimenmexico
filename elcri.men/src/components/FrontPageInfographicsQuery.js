import {useStaticQuery, graphql} from 'gatsby';

const useFrontPageInfographics = () => {
  const data = useStaticQuery (
    graphql`{
    allFile(filter: {name: {regex: "/(^municipios_|^infographic_)/"}}) {
      edges {
        node {
          childImageSharp {
            fluid(maxWidth: 432) {
              ...GatsbyImageSharpFluid_withWebp
              originalName
              originalImg
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

export default useFrontPageInfographics;
