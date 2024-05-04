import {useStaticQuery, graphql} from 'gatsby';

const useBestImages = () => {
  const data = useStaticQuery (graphql`
query indexQuery {
  
  anomalies:file(relativePath: {eq: "anomalies.png"}) {
    childImageSharp {
      fixed(width: 128, height: 128, quality: 80) {
        ...GatsbyImageSharpFixed_withWebp_noBase64
        originalName
        width
      }
    }
  }

  trend:file(relativePath: {eq: "trend.png"}) {
    childImageSharp {
      fixed(width: 128, height: 128, quality: 80) {
        ...GatsbyImageSharpFixed_withWebp_noBase64
        originalName
        width
      }
    }
  }

  mapa:file(relativePath: {eq: "mapa.png"}) {
    childImageSharp {
      fixed(width: 128, height: 128, quality: 80) {
        ...GatsbyImageSharpFixed_withWebp_noBase64
        originalName
        width
      }
    }
  }
   
   
  
}
`);
  return data;
};

export default useBestImages;