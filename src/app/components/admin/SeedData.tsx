import { useState } from 'react';
import { Database, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../../lib/supabase';

interface Props {
  getAuthToken: () => string;
  onSuccess: () => Promise<void>;
}

export function SeedData({ getAuthToken, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const universitySeedList = [
    { name: 'University of Oxford', city: 'Oxford', featured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1687361242200-c5122b63fe70?w=800' },
    { name: 'University of Cambridge', city: 'Cambridge', featured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1597670964482-c6050c616e5c?w=800' },
    { name: 'Imperial College London', city: 'London', featured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1682264359568-cf5dda99910b?w=800' },
    { name: 'University College London', city: 'London' },
    { name: 'London School of Economics and Political Science', city: 'London' },
    { name: 'King\'s College London', city: 'London' },
    { name: 'University of Manchester', city: 'Manchester' },
    { name: 'University of Edinburgh', city: 'Edinburgh' },
    { name: 'University of Warwick', city: 'Coventry' },
    { name: 'University of Bristol', city: 'Bristol' },
    { name: 'University of Glasgow', city: 'Glasgow' },
    { name: 'University of Birmingham', city: 'Birmingham' },
    { name: 'University of Leeds', city: 'Leeds' },
    { name: 'University of Nottingham', city: 'Nottingham' },
    { name: 'Durham University', city: 'Durham' },
    { name: 'University of Southampton', city: 'Southampton' },
    { name: 'University of Sheffield', city: 'Sheffield' },
    { name: 'University of Liverpool', city: 'Liverpool' },
    { name: 'University of York', city: 'York' },
    { name: 'University of Exeter', city: 'Exeter' },
    { name: 'University of Bath', city: 'Bath' },
    { name: 'Lancaster University', city: 'Lancaster' },
    { name: 'University of Sussex', city: 'Brighton' },
    { name: 'Queen Mary University of London', city: 'London' },
    { name: 'Newcastle University', city: 'Newcastle' },
    { name: 'University of Surrey', city: 'Guildford' },
    { name: 'University of Kent', city: 'Canterbury' },
    { name: 'University of East Anglia', city: 'Norwich' },
    { name: 'University of Strathclyde', city: 'Glasgow' },
    { name: 'Loughborough University', city: 'Loughborough' },
    { name: 'Cardiff University', city: 'Cardiff' },
    { name: 'University of Reading', city: 'Reading' },
    { name: 'University of Aberdeen', city: 'Aberdeen' },
    { name: 'University of Leicester', city: 'Leicester' },
    { name: 'Queen\'s University Belfast', city: 'Belfast' },
    { name: 'University of Dundee', city: 'Dundee' },
    { name: 'University of Lincoln', city: 'Lincoln' },
    { name: 'Heriot-Watt University', city: 'Edinburgh' },
    { name: 'University of Stirling', city: 'Stirling' },
    { name: 'University of Bradford', city: 'Bradford' },
    { name: 'University of Hull', city: 'Hull' },
    { name: 'University of Plymouth', city: 'Plymouth' },
    { name: 'Bangor University', city: 'Bangor' },
    { name: 'Aston University', city: 'Birmingham' },
    { name: 'University of Salford', city: 'Salford' },
    { name: 'Ulster University', city: 'Belfast' },
    { name: 'Manchester Metropolitan University', city: 'Manchester' },
    { name: 'University of the West of England', city: 'Bristol' },
    { name: 'University of Hertfordshire', city: 'Hatfield' },
    { name: 'University of Westminster', city: 'London' },
    { name: 'Kingston University', city: 'London' },
    { name: 'University of Brighton', city: 'Brighton' },
    { name: 'Coventry University', city: 'Coventry' },
    { name: 'University of Central Lancashire', city: 'Preston' },
    { name: 'University of Chester', city: 'Chester' },
    { name: 'University of the West of Scotland', city: 'Paisley' },
    { name: 'Sheffield Hallam University', city: 'Sheffield' },
    { name: 'Liverpool John Moores University', city: 'Liverpool' },
    { name: 'University of Sunderland', city: 'Sunderland' },
    { name: 'University of Huddersfield', city: 'Huddersfield' },
    { name: 'Roehampton University', city: 'London' },
    { name: 'University of East London', city: 'London' },
    { name: 'Goldsmiths, University of London', city: 'London' },
    { name: 'Middlesex University', city: 'London' },
    { name: 'University of Greenwich', city: 'London' },
    { name: 'Birkbeck, University of London', city: 'London' },
    { name: 'City, University of London', city: 'London' },
    { name: 'Royal Holloway, University of London', city: 'Egham' },
    { name: 'Brunel University London', city: 'Uxbridge' },
    { name: 'University of Bedfordshire', city: 'Luton' },
    { name: 'London Metropolitan University', city: 'London' },
    { name: 'University of Portsmouth', city: 'Portsmouth' },
    { name: 'University of Wolverhampton', city: 'Wolverhampton' },
    { name: 'University of Worcester', city: 'Worcester' },
    { name: 'University of Buckingham', city: 'Buckingham' },
    { name: 'Liverpool Hope University', city: 'Liverpool' },
    { name: 'Staffordshire University', city: 'Stoke-on-Trent' },
    { name: 'Northumbria University', city: 'Newcastle' },
    { name: 'Teesside University', city: 'Middlesbrough' },
    { name: 'University of West London', city: 'London' },
    { name: 'University of Derby', city: 'Derby' },
    { name: 'Anglia Ruskin University', city: 'Cambridge' },
    { name: 'University of Suffolk', city: 'Ipswich' },
    { name: 'University of Cumbria', city: 'Carlisle' },
    { name: 'University of Northampton', city: 'Northampton' },
    { name: 'Falmouth University', city: 'Falmouth' },
    { name: 'Norwich University of the Arts', city: 'Norwich' },
    { name: 'University of Chichester', city: 'Chichester' },
    { name: 'Buckinghamshire New University', city: 'High Wycombe' },
    { name: 'University of Gloucestershire', city: 'Cheltenham' },
    { name: 'Canterbury Christ Church University', city: 'Canterbury' },
    { name: 'Edinburgh Napier University', city: 'Edinburgh' },
    { name: 'London South Bank University', city: 'London' },
    { name: 'St Mary\'s University, Twickenham', city: 'Twickenham' },
    { name: 'University of the Highlands and Islands', city: 'Inverness' },
    { name: 'University of St Andrews', city: 'St Andrews' },
    { name: 'Royal Agricultural University', city: 'Cirencester' },
    { name: 'Bishop Grosseteste University', city: 'Lincoln' },
    { name: 'University for the Creative Arts', city: 'Farnham' },
    { name: 'University of Winchester', city: 'Winchester' },
    { name: 'University of the Arts London', city: 'London' },
    { name: 'Cardiff Metropolitan University', city: 'Cardiff' },
    { name: 'University of South Wales', city: 'Cardiff' },
  ];

  const sampleUniversities = universitySeedList.map((uni, index) => {
    const slug = uni.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return {
      name: uni.name,
      city: uni.city,
      country: 'United Kingdom',
      description: `${uni.name} is a leading university located in ${uni.city}, United Kingdom. It offers a broad range of undergraduate and postgraduate degrees across the arts, sciences, engineering, business, and health fields.`,
      latitude: 51.5 + (index % 8) * 0.01,
      longitude: -0.1 - (index % 6) * 0.01,
      address: `${uni.city} Campus, ${uni.city}, UK`,
      tuitionFeesUG: '£9,250/year (UK), £18,000-£26,000/year (International)',
      tuitionFeesPG: '£12,000-£32,000/year',
      applicationFee: '£75',
      intakes: ['September'],
      academicRequirementsUG: 'AAB-BBB at A-level or equivalent.',
      academicRequirementsPG: 'UK 2:1 honours degree or equivalent.',
      ieltsRequired: true,
      ieltsScore: '6.5 overall',
      pteRequired: false,
      campusSize: 'Large campus with modern facilities',
      facilities: ['Libraries', 'Lecture Theatres', 'Sports Facilities', 'Student Accommodation', 'Research Centres'],
      email: `admissions@${slug}.ac.uk`,
      phone: '+44 1234 567890',
      website: `https://www.${slug}.ac.uk`,
      featured: !!uni.featured,
      thumbnailUrl: uni.thumbnailUrl || 'https://images.unsplash.com/photo-1519664699825-ddb2c64076bf?w=800',
    };
  });

  const sampleScholarships = [
    {
      name: 'Oxford Reach Scholarship',
      amount: 'Full tuition + £17,668 living costs',
      eligibility: 'Students from low-income countries with excellent academic records',
      deadline: '31st January 2027',
      description: 'Fully-funded scholarship for undergraduate students from underrepresented countries.',
    },
    {
      name: 'Cambridge International Scholarship',
      amount: '£30,000/year',
      eligibility: 'Outstanding international students with first-class honours',
      deadline: '1st December 2026',
      description: 'Merit-based scholarship for postgraduate research students.',
    },
    {
      name: 'Imperial President\'s Scholarship',
      amount: 'Full tuition waiver',
      eligibility: 'Exceptional international undergraduate applicants',
      deadline: '15th January 2027',
      description: 'Competitive scholarship based on academic excellence and leadership potential.',
    },
  ];

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in as admin before seeding.');
        return;
      }

      let createdCount = 0;
      let failedCount = 0;

      // Create universities
      for (const uniData of sampleUniversities) {
        const response = await fetch(`${API_URL}/universities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(uniData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          failedCount += 1;
          console.error('University seed failed:', response.status, responseData);
          continue;
        }

        createdCount += 1;

        if (createdCount <= 3 && responseData?.university?.id) {
          const universityId = responseData.university.id;
          const scholarship = {
            ...sampleScholarships[createdCount - 1],
            universityId,
          };

          await fetch(`${API_URL}/scholarships`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(scholarship),
          });
        }
      }

      if (createdCount === 0) {
        toast.error('No universities were created. Please check your admin token and try again.');
        return;
      }

      toast.success(`Successfully created ${createdCount} universities!`);
      await onSuccess();
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Yet - Get Started Quickly
          </h3>
          <p className="text-gray-600 mb-4">
            Your database is empty. You can either add universities manually using the "Add University" button above, 
            or click below to populate the database with 100+ UK universities including Oxford, Cambridge, and Imperial College.
          </p>
          <button
            onClick={seedDatabase}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Sample Data...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Create 100+ UK Universities
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
