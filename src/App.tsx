import { useEffect } from 'react'
import { scrollToHash, useLocation } from './router'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Calc from './pages/Calc'
import Result from './pages/Result'

export default function App() {
  const { path, hash } = useLocation()

  useEffect(() => {
    if (hash) scrollToHash(hash)
  }, [path, hash])

  let page
  if (path.startsWith('/raschet')) page = <Calc />
  else if (path.startsWith('/primer')) page = <Result demo />
  else if (path.startsWith('/rezultat')) page = <Result />
  else page = <Home />

  return (
    <>
      <Header />
      <main>{page}</main>
      <Footer />
    </>
  )
}
