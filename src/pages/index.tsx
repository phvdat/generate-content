import { NextPage } from 'next'
import Layout from '../components/Layout'
import UploadForm from 'components/UploadForm'

const IndexPage: NextPage = () => {
  return (
    <Layout>
      {/* <MessagesList />
        <div className="fixed bottom-0 right-0 left-0">
          <MessageForm />
        </div> */}
      <UploadForm />
    </Layout>
  )
}

export default IndexPage
