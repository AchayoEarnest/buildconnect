import { profilesApi } from '@/lib/api/profiles'
import { notFound } from 'next/navigation'
import PortfolioGrid from '@/components/engineer/PortfolioGrid'
import StarRating from '@/components/shared/StarRating'
import VerificationBadge from '@/components/engineer/VerificationBadge'
import ContactButton from '@/components/engineer/ContactButton'
import { MapPin, Briefcase, Globe } from 'lucide-react'

export default async function EngineerProfilePage({ params }: { params: { slug: string } }) {
  let engineer
  try {
    const { data } = await profilesApi.getEngineer(params.slug)
    engineer = data
  } catch {
    notFound()
  }

  const availabilityColor: Record<string, string> = {
    available:   'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    busy:        'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    unavailable: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative shrink-0">
            <img
              src={engineer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(engineer.full_name)}&size=96`}
              alt={engineer.full_name}
              className="w-24 h-24 rounded-2xl object-cover"
            />
            {engineer.is_verified && <VerificationBadge className="absolute -bottom-2 -right-2" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.full_name}</h1>
                <p className="text-gray-500 mt-0.5 font-medium">{engineer.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{engineer.location_city}, {engineer.location_country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />{engineer.years_exp} yrs exp
                  </span>
                  {engineer.website_url && (
                    <a href={engineer.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-600 hover:underline">
                      <Globe className="w-4 h-4" />Website
                    </a>
                  )}
                </div>
              </div>
              {/* FIX: pass engineer.user_id (UUID) not engineer.id (int profile id) */}
              <ContactButton
                engineerSlug={engineer.slug}
                engineerUserId={engineer.user_id}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <StarRating value={engineer.avg_rating} />
              <span className="text-sm text-gray-500">({engineer.review_count} reviews)</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${availabilityColor[engineer.availability]}`}>
                {engineer.availability}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {engineer.skills.map((skill) => (
                <span key={skill.id}
                  className="text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{engineer.bio}</p>
          </section>
          {engineer.portfolio.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
              <PortfolioGrid projects={engineer.portfolio} />
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-6">
            {engineer.hourly_rate && (
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${engineer.hourly_rate}</span>
                <span className="text-gray-400 text-base">/hr</span>
              </div>
            )}
            {/* FIX: pass user_id here too */}
            <ContactButton
              engineerSlug={engineer.slug}
              engineerUserId={engineer.user_id}
              className="w-full"
              variant="primary"
            />
          </div>
          {engineer.certifications.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold mb-4">Certifications</h3>
              <div className="space-y-3">
                {engineer.certifications.map((cert) => (
                  <div key={cert.id} className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{cert.name}</p>
                    <p className="text-gray-400">{cert.issuer} · {cert.issued_on}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
