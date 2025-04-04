export default function PrivacyPage() {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto bg-black/80 rounded-2xl p-8 backdrop-blur-md border border-white/10">
          <h1 className="text-3xl font-semibold text-white mb-8">Privacy Policy</h1>
          <div className="space-y-6">
            <p className="text-white text-base">This Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your information when you use the Service and tells you about your privacy rights and how the law protects You. We use your Personal Data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Personal Data</h2>
            <p className="text-white text-base">While using Our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-white text-base">Email address</li>
              <li className="text-white text-base">First name and last name</li>
              <li className="text-white text-base">Twitter and Discord account</li>
              <li className="text-white text-base">Usage Data</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Usage Data</h2>
            <p className="text-white text-base">Usage Data is collected automatically when using the Service. Usage Data may include information such as your Device&apos;s Internet Protocol address (e.g., IP address), browser type, browser version, etc.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Tracking Technologies and Cookies</h2>
            <p className="text-white text-base">We use Cookies and similar tracking technologies to track activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service. The technologies we use may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-white text-base"><strong className="text-white">Cookies or Browser Cookies:</strong> A cookie is a small file placed on your Device. You can instruct your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if you do not accept Cookies, you may not be able to use some parts of our Service. Unless you have adjusted your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
              <li className="text-white text-base"><strong className="text-white">Web Beacons:</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit CyreneAI, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 