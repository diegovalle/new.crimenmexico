import Img from 'gatsby-image'
import { graphql } from 'gatsby'

const ImageInfo = (props) => (
  <StaticQuery
    query={graphql`
      query {
    allFile(filter: {name: {regex: "/(^municipios_|^infographic_)/"}}) {
      edges {
        node {
          childImageSharp {
            fluid(maxWidth: 432) {
              originalName
            }
          }
          base
          id
        }
      }
    }
  }
    `}

    render={(data) => {
      const image = data.images.edges.find(n => {
        return n.node.relativePath.includes(props.filename);
      });
      if (!image) { return null; }
      
      const imageSizes = image.node.childImageSharp.sizes;
      return (
        <Img
          alt={props.alt}
          sizes={imageSizes}
        />
      );
    }}
  />
)

export default ImageInfo;