
const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
<footer className="footer bg-base-200 text-base-content p-10">
  <aside>
    
    <p>
    <span>©</span> {currentYear} influx.io
      <br />
      All rights reserved
    </p>
  </aside>

  <nav>
    <h6 className="footer-title">Company</h6>
    <a className="link link-hover">About us</a>
    <a className="link link-hover">Contact</a>
  </nav>
  <nav>
    <h6 className="footer-title">Legal</h6>
    <a className="link link-hover">Terms of use</a>
    <a className="link link-hover">Privacy policy</a>
    <a className="link link-hover">Cookie policy</a>
  </nav>
</footer>)

}

export default Footer;