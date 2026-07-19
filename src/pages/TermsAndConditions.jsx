import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold mb-8">Terms of Service & Privacy Policy</h1>
        <div className="space-y-8 text-onLight/65 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-onLight text-base mb-2">1. Your account</h2>
            <p>
              You agree to provide accurate identity information at registration, including the KYC
              details required to verify your account. Oscillate Marketing may suspend accounts found to contain
              false information.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-onLight text-base mb-2">2. Buying and selling</h2>
            <p>
              Customers may browse the marketplace without an account. Purchasing and vendor listing
              both require a verified account. Vendors are reviewed before they can list products;
              approval is not guaranteed.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-onLight text-base mb-2">3. Reviews</h2>
            <p>
              Product and vendor reviews must reflect a genuine transaction. Oscillate Marketing reserves the right
              to remove reviews that violate this policy.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-onLight text-base mb-2">4. Data & privacy</h2>
            <p>
              Identity documents are used solely for verification and are not shared with other
              users. Admins access only the operational data needed for platform oversight.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
