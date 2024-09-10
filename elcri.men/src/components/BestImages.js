import { useStaticQuery, graphql } from 'gatsby'

const useBestImages = () => {
  const data = useStaticQuery(graphql`
    query indexQuery {
      anomalies: file(relativePath: { eq: "anomalies.png" }) {
        childImageSharp {
          gatsbyImageData(
            width: 128
            height: 128
            quality: 80
            placeholder: NONE
            layout: CONSTRAINED
          )
        }
      }

      trend: file(relativePath: { eq: "trend.png" }) {
        childImageSharp {
          gatsbyImageData(
            width: 128
            height: 128
            quality: 80
            placeholder: NONE
            layout: CONSTRAINED
          )
        }
      }

      mapa: file(relativePath: { eq: "mapa.png" }) {
        childImageSharp {
          gatsbyImageData(
            width: 128
            height: 128
            quality: 80
            placeholder: NONE
            layout: CONSTRAINED
          )
        }
      }
    }
  `)
  return data
}

export default useBestImages
