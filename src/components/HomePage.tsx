import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Award, 
  BookOpen, 
  Star, 
  Heart, 
  Shield, 
  Zap,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogin }) => {
  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student records and enrollment system',
      color: 'bg-blue-500'
    },
    {
      icon: GraduationCap,
      title: 'Teacher Portal',
      description: 'Manage faculty information and attendance tracking',
      color: 'bg-green-500'
    },
    {
      icon: BookOpen,
      title: 'Academic Records',
      description: 'Track academic progress and generate reports',
      color: 'bg-purple-500'
    },
    {
      icon: Award,
      title: 'Fee Management',
      description: 'Automated billing and payment tracking system',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Students', icon: Users },
    { number: '25+', label: 'Expert Teachers', icon: GraduationCap },
    { number: '10+', label: 'Years Experience', icon: Award },
    { number: '98%', label: 'Success Rate', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Parent',
      content: 'Kid\'s Zone Academy has been amazing for my child\'s development. The teachers are caring and the environment is perfect for learning.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Parent',
      content: 'The digital management system makes it so easy to track my child\'s progress. Highly recommend this academy!',
      rating: 5
    },
    {
      name: 'Sunita Devi',
      role: 'Parent',
      content: 'Excellent facilities and wonderful staff. My daughter loves coming to school every day.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kid's Zone Academy</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={onLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Welcome to
                  <span className="text-blue-600 block">Kid's Zone Academy</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Where learning meets innovation. We provide a nurturing environment for children to grow, learn, and excel in their educational journey.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onLogin}
                  className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  Access Management System
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <a
                  href="#about"
                  className="flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-lg"
                >
                  Learn More
                </a>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Certified Teachers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Modern Facilities</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/Kid-Zone Logo.png" 
                  alt="Kid's Zone Academy"
                  className="w-full h-64 object-contain rounded-lg"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Learning Today, Leading Tomorrow</h3>
                  <p className="text-gray-600 mt-2">Our motto drives everything we do</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-6 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Kid's Zone Academy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to providing quality education in a safe, nurturing environment where every child can thrive and reach their full potential.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Caring Environment</h3>
              <p className="text-gray-600">
                We create a warm, supportive atmosphere where children feel safe to explore, learn, and express themselves freely.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
              <p className="text-gray-600">
                Your child's safety is our top priority. We maintain the highest standards of security and supervision.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovative Learning</h3>
              <p className="text-gray-600">
                We use modern teaching methods and technology to make learning engaging, interactive, and fun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Management System Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive school management system streamlines operations and enhances the educational experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Parents Say</h2>
            <p className="text-xl text-gray-600">
              Hear from our satisfied parents about their experience with Kid's Zone Academy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-300">
              Ready to give your child the best education? Contact us today!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="text-gray-300">
                Infront Of St. Mary's School<br />
                Zamania Ghazipur<br />
                Uttar Pradesh
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-300">+91 6388842678</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-300">kidszoneacademyy@gmail.com</p>
            </div>
          </div>

          <div className="text-center mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400">
              © 2024 Kid's Zone Academy. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;