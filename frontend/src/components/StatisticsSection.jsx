import { Award, Clock, Users, Shield, Star, TrendingUp, CheckCircle } from 'lucide-react';

export function StatisticsSection() {
  const achievements = [
    {
      icon: Award,
      title: 'Accredited Excellence',
      description: 'Joint Commission Gold Seal',
    },
    {
      icon: Clock,
      title: '24/7 Care',
      description: 'Round-the-clock emergency services',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Board-certified physicians',
    },
    {
      icon: Shield,
      title: 'Compassionate Care',
      description: 'Patient-centered approach',
    },
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-sky-100 to-blue-100">
      <div className="container mx-auto px-4">
        {/* Legacy & Statistics */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Our Legacy of Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three decades of pioneering healthcare, advancing medical science, 
            and touching lives with compassionate care.
          </p>
        </div>


        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.title}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
                style={{ animationDelay: `${index * 0.1 + 0.4}s`  }}
              >
                <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recognition Banner */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 mr-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              Nationally Recognized Healthcare
            </h3>
            <Star className="h-8 w-8 text-yellow-500 ml-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-secondary">Top 3 Hospitals Nationwide</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-secondary">Magnet Hospital Recognition</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-secondary">5-Star Patient Safety Rating</span>
            </div>
          </div>
          <p className="text-gray-600">
            Committed to excellence in patient care, medical innovation, and community health
          </p>
        </div>
      </div>
    </section>
  );
}
