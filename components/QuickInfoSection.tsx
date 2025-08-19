import React from 'react';
import {
  Users,
  Code,
  Globe,
  CheckCircle,
  ArrowUpRight,
  Award,
  Clock,
  Shield,
} from 'lucide-react';

interface QuickInfoSectionProps {}

export const QuickInfoSection: React.FC<QuickInfoSectionProps> = () => {
  const infoCards = [
    {
      icon: <Users size={24} className="text-mintoon-primary" />,
      title: 'Expert Staff',
      description: 'Top industry professionals',
      color: 'primary',
    },
    {
      icon: <Award size={24} className="text-mintoon-secondary" />,
      title: 'Proven Results',
      description: 'Delivering excellence since 2010',
      color: 'secondary',
    },
    {
      icon: <Code size={24} className="text-mintoon-accent" />,
      title: 'Custom Solutions',
      description: 'Tailored to your needs',
      color: 'accent',
    },
    {
      icon: <Clock size={24} className="text-mintoon-primary" />,
      title: '24/7 Support',
      description: 'Always available assistance',
      color: 'primary',
    },
  ];

  return (
    <div className="py-16 bg-white relative z-10 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-screen-xl">
            {infoCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-floating border border-gray-100 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex items-center gap-5 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-mintoon-${card.color}/10 flex items-center justify-center flex-shrink-0 group-hover:bg-mintoon-${card.color} transition-colors duration-300`}
                >
                  <div
                    className={`text-mintoon-${card.color} group-hover:text-white transition-colors duration-300`}
                  >
                    {card.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg  text-mintoon-dark group-hover:text-mintoon-primary transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-mintoon-textLight text-sm mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeaturesBannerProps {}

export const FeaturesBanner: React.FC<FeaturesBannerProps> = () => {
  return (
    <div className="py-10 px-24 bg-gradient-to-r from-mintoon-primary via-mintoon-secondary to-mintoon-accent animate-gradient-x bg-300% text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield size={32} className="text-white" />
            <div>
              <h3 className="text-lg ">Enterprise-Grade Security</h3>
              <p className="text-white/80 text-sm">
                Advanced protection for your data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={32} className="text-white" />
            <div>
              <h3 className="text-lg ">Rapid Deployment</h3>
              <p className="text-white/80 text-sm">
                Quick implementation of solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award size={32} className="text-white" />
            <div>
              <h3 className="text-lg ">Industry Recognition</h3>
              <p className="text-white/80 text-sm">Award-winning IT services</p>
            </div>
          </div>

          <a
            href="#contact"
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors duration-300 backdrop-blur-sm flex items-center gap-2 group whitespace-nowrap"
          >
            Get Started
            <ArrowUpRight
              size={18}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
