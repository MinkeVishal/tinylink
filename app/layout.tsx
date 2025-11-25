import './globals.css'

export const metadata = {
  title: 'Tinylink',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="site">
          <header className="site-header">
            <div>
              <div className="site-title">Tinylink</div>
              <div className="site-sub">Create and track short links</div>
            </div>
            <div>
              <a className="nav-link" href="/">Dashboard</a>
              <a className="nav-link" href="/api/healthz">Health</a>
            </div>
          </header>
          <div className="dashboard">{children}</div>
          <footer className="site-footer">
            <div className="footer">
              <div className="footer-left">
                <div>© {new Date().getFullYear()} Tinylink</div>
                <div className="footer-links">
                  <a href="/">Dashboard</a>
                  <a href="/api/healthz">Health</a>
                  <a href="/privacy">Privacy</a>
                </div>
              </div>
              <div className="footer-right">
                <div className="footer-note">Built with ❤️ • v0.1.0</div>
              </div>
            </div>
          </footer>
        </main>
      </body>
    </html>
  )
}
