import Logo from "@/components/logo"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <Logo className="h-12 w-12 mr-4" />
        <h1 className="text-3xl font-bold">About Photool</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <p className="mb-4">
          Photool is a cutting-edge web application designed to bring professional-grade photo editing capabilities to
          everyone. Whether you're a seasoned photographer or just someone who loves to enhance their social media
          posts, Photool offers an intuitive interface and powerful features to help you achieve stunning results.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Our Features</h2>
        <ul className="list-disc list-inside mb-4">
          <li>100+ unique photo effects and filters</li>
          <li>Advanced editing tools including brightness, contrast, and saturation adjustments</li>
          <li>Crop and resize functionality</li>
          <li>Before/after comparison view</li>
          <li>Undo/redo capabilities for worry-free editing</li>
          <li>Mobile-friendly design for editing on-the-go</li>
        </ul>
        <p className="mb-4">
          Our team is constantly working on adding new features and improving existing ones. We're committed to
          providing the best possible photo editing experience right in your browser.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
        <p>
          We love hearing from our users! If you have any questions, suggestions, or just want to say hello, please
          don't hesitate to{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  )
}

