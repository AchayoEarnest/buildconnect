"""
Usage:
    python manage.py seed_demo

Creates a complete set of demo data:
  - 2 client accounts + 6 engineer accounts
  - Engineer profiles with skills, certs, portfolio projects
  - 8 open projects across Nairobi, Mombasa, Kisumu
  - Bids, conversations, messages, notifications
  - Analytics profile views

All passwords:  Demo1234!
Admin login:    admin@buildconnect.co / Demo1234!
"""
import uuid
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify


# ─── helpers ──────────────────────────────────────────────────────────────────

def d(days: int) -> date:
    return (timezone.now() + timedelta(days=days)).date()


def iso(days: int) -> str:
    return d(days).isoformat()


# ─── command ──────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Seed the database with realistic demo data'

    def handle(self, *args, **kwargs):
        from apps.users.models import User
        from apps.profiles.models import (
            EngineerProfile, ClientProfile, Skill,
            Certification, PortfolioProject,
        )
        from apps.projects.models import Project, Bid, Milestone
        from apps.messaging.models import Conversation, Message
        from apps.notifications.models import Notification

        self.stdout.write('🌱  Seeding demo data…')

        PASSWORD = 'Demo1234!'

        # ── Admin ─────────────────────────────────────────────────────────────
        admin, _ = User.objects.get_or_create(email='admin@buildconnect.co', defaults={
            'first_name': 'Admin', 'last_name': 'User',
            'role': 'admin', 'is_staff': True, 'is_superuser': True, 'is_verified': True,
        })
        admin.set_password(PASSWORD); admin.save()

        # ── Clients ───────────────────────────────────────────────────────────
        clients_data = [
            dict(email='amara.osei@kenyadev.co', first_name='Amara', last_name='Osei',
                 company='Kenya Dev Properties', industry='Real Estate', location='Nairobi'),
            dict(email='fatima.wanjiku@infrake.go.ke', first_name='Fatima', last_name='Wanjiku',
                 company='InfraKE Government', industry='Government', location='Nairobi'),
        ]
        client_users = []
        for cd in clients_data:
            u, _ = User.objects.get_or_create(email=cd['email'], defaults={
                'first_name': cd['first_name'], 'last_name': cd['last_name'],
                'role': 'client', 'is_verified': True,
            })
            u.set_password(PASSWORD); u.save()
            cp, _ = ClientProfile.objects.get_or_create(user=u, defaults={
                'company_name': cd['company'],
                'industry':     cd['industry'],
                'location':     cd['location'],
            })
            client_users.append(u)

        # ── Skills master list ────────────────────────────────────────────────
        skill_names = [
            'AutoCAD', 'Revit', 'Civil 3D', 'SAP2000', 'ETABS', 'STAAD.Pro',
            'Primavera P6', 'MS Project', 'BIM', 'Structural Analysis',
            'Foundation Design', 'Road Design', 'Drainage Design',
            'Quantity Takeoff', 'Cost Estimation', 'Site Supervision',
            'Contract Management', 'Steel Fabrication', 'Concrete Works', 'GIS',
        ]
        skill_objs = {n: Skill.objects.get_or_create(name=n)[0] for n in skill_names}

        # ── Engineers ─────────────────────────────────────────────────────────
        engineers_data = [
            dict(
                email='james.mwangi@buildconnect.co', first_name='James', last_name='Mwangi',
                title='Senior Structural Engineer', specialization='structural',
                bio='10+ years designing high-rise and residential structures across East Africa. Led the Westlands Mixed-Use Tower project and several affordable housing schemes.',
                years_exp=10, hourly_rate=85, city='Nairobi', country='Kenya',
                availability='available', avg_rating=4.8, review_count=24,
                skills=['SAP2000', 'ETABS', 'AutoCAD', 'Revit', 'Structural Analysis', 'Foundation Design'],
                certs=[
                    dict(name='Professional Engineer (PE)', issuer='Engineers Board of Kenya', issued_on='2016-03-01'),
                    dict(name='ETABS Certified Professional', issuer='CSI', issued_on='2019-07-15'),
                ],
            ),
            dict(
                email='grace.achieng@buildconnect.co', first_name='Grace', last_name='Achieng',
                title='Civil & Road Engineer', specialization='civil',
                bio='Specialist in road design, drainage systems and infrastructure development. Worked extensively with Kenya National Highways Authority on major road rehabilitation projects.',
                years_exp=7, hourly_rate=70, city='Kisumu', country='Kenya',
                availability='available', avg_rating=4.7, review_count=18,
                skills=['Civil 3D', 'Road Design', 'Drainage Design', 'AutoCAD', 'GIS'],
                certs=[
                    dict(name='Graduate Civil Engineer', issuer='Engineers Board of Kenya', issued_on='2017-05-01'),
                ],
            ),
            dict(
                email='samuel.kipkemoi@buildconnect.co', first_name='Samuel', last_name='Kipkemoi',
                title='Quantity Surveyor & Cost Estimator', specialization='quantity_surveyor',
                bio='Expert in bill of quantities, cost planning, and tender management. Saved clients an average of 18% on construction costs through rigorous value engineering.',
                years_exp=8, hourly_rate=60, city='Nairobi', country='Kenya',
                availability='busy', avg_rating=4.9, review_count=31,
                skills=['Quantity Takeoff', 'Cost Estimation', 'MS Project', 'Contract Management'],
                certs=[
                    dict(name='MRICS', issuer='Royal Institution of Chartered Surveyors', issued_on='2018-09-01'),
                ],
            ),
            dict(
                email='linda.mutua@buildconnect.co', first_name='Linda', last_name='Mutua',
                title='Architect & BIM Specialist', specialization='architect',
                bio='Award-winning architect with a passion for sustainable design. Proficient in Revit BIM workflows. Projects range from corporate offices to eco-lodges.',
                years_exp=9, hourly_rate=90, city='Nairobi', country='Kenya',
                availability='available', avg_rating=4.6, review_count=15,
                skills=['Revit', 'BIM', 'AutoCAD', 'SketchUp', 'Site Supervision'],
                certs=[
                    dict(name='Registered Architect', issuer='Board of Registration of Architects & Quantity Surveyors', issued_on='2015-11-01'),
                ],
            ),
            dict(
                email='david.otieno@buildconnect.co', first_name='David', last_name='Otieno',
                title='Mechanical & HVAC Engineer', specialization='mechanical',
                bio='Specialist in HVAC, plumbing, and fire suppression systems for commercial buildings. Designed MEP systems for 5-star hotels and major shopping malls.',
                years_exp=6, hourly_rate=65, city='Mombasa', country='Kenya',
                availability='available', avg_rating=4.5, review_count=12,
                skills=['AutoCAD', 'Site Supervision', 'Contract Management', 'Concrete Works'],
                certs=[],
            ),
            dict(
                email='caroline.njeri@buildconnect.co', first_name='Caroline', last_name='Njeri',
                title='Geotechnical Engineer', specialization='geotechnical',
                bio='Foundation investigation, slope stability and soil testing expert. Provided geotechnical reports for over 60 projects including high-rises and bridges.',
                years_exp=11, hourly_rate=80, city='Nairobi', country='Kenya',
                availability='unavailable', avg_rating=4.9, review_count=27,
                skills=['Foundation Design', 'Structural Analysis', 'AutoCAD', 'GIS', 'STAAD.Pro'],
                certs=[
                    dict(name='Chartered Geotechnical Engineer', issuer='Engineers Board of Kenya', issued_on='2014-02-01'),
                ],
            ),
        ]

        engineer_users = []
        engineer_profiles = []
        for ed in engineers_data:
            u, _ = User.objects.get_or_create(email=ed['email'], defaults={
                'first_name': ed['first_name'], 'last_name': ed['last_name'],
                'role': 'engineer', 'is_verified': True,
            })
            u.set_password(PASSWORD); u.save()

            slug_base = slugify(f"{ed['first_name']}-{ed['last_name']}")
            ep, _ = EngineerProfile.objects.get_or_create(user=u, defaults={
                'slug':             slug_base,
                'title':            ed['title'],
                'specialization':   ed['specialization'],
                'bio':              ed['bio'],
                'years_exp':        ed['years_exp'],
                'hourly_rate':      ed['hourly_rate'],
                'location_city':    ed['city'],
                'location_country': ed['country'],
                'availability':     ed['availability'],
                'avg_rating':       ed['avg_rating'],
                'review_count':     ed['review_count'],
                'is_verified':      True,
                'profile_views':    ed['review_count'] * 7,
            })
            ep.skills.set([skill_objs[s] for s in ed['skills'] if s in skill_objs])

            for cert in ed['certs']:
                Certification.objects.get_or_create(
                    engineer=ep, name=cert['name'],
                    defaults={'issuer': cert['issuer'], 'issued_on': cert['issued_on']},
                )

            # Portfolio entry
            PortfolioProject.objects.get_or_create(
                engineer=ep,
                title=f"{ed['city']} Landmark Project",
                defaults={
                    'description': f"A flagship {ed['specialization'].replace('_', ' ')} project showcasing expertise in {', '.join(ed['skills'][:2])}.",
                    'location':    ed['city'],
                    'client_name': 'Confidential Client',
                    'completed':   d(-180),
                },
            )

            engineer_users.append(u)
            engineer_profiles.append(ep)

        # ── Projects ──────────────────────────────────────────────────────────
        c1, c2 = client_users[0], client_users[1]
        cp1 = c1.client_profile
        cp2 = c2.client_profile

        projects_data = [
            dict(client=cp1, title='3-Bedroom Residential Development in Karen',
                 description='Construction of three 3-bedroom maisonettes on a 0.5-acre plot in Karen, Nairobi. Requires full structural, architectural and MEP works. Site has existing borehole. Expected to house 3 families.',
                 skills=['Structural Analysis', 'AutoCAD', 'Site Supervision', 'Foundation Design'],
                 budget_min=4_500_000, budget_max=7_000_000, deadline=d(90), location='Karen, Nairobi',
                 status='open'),
            dict(client=cp1, title='Commercial Office Fit-Out – Upperhill',
                 description='Full fit-out of a 2,400 sq ft open-plan office on the 8th floor of a Grade-A building in Upperhill. Includes partitions, ceilings, MEP, and IT infrastructure.',
                 skills=['AutoCAD', 'BIM', 'Revit', 'Site Supervision'],
                 budget_min=1_800_000, budget_max=3_200_000, deadline=d(60), location='Upperhill, Nairobi',
                 status='open'),
            dict(client=cp2, title='Rural Road Rehabilitation – Kisumu–Siaya Corridor',
                 description='Rehabilitation of 14 km unpaved road including grading, culvert installation, drainage improvements, and surface treatment. Part of county roads programme.',
                 skills=['Road Design', 'Drainage Design', 'Civil 3D', 'GIS', 'Contract Management'],
                 budget_min=28_000_000, budget_max=45_000_000, deadline=d(180), location='Kisumu County',
                 status='open'),
            dict(client=cp2, title='Geotechnical Investigation – Mombasa Port Expansion',
                 description='Subsurface investigation for proposed port expansion area. Requires borehole drilling, lab testing, and a geotechnical report to support foundation design.',
                 skills=['Foundation Design', 'GIS', 'Structural Analysis'],
                 budget_min=2_200_000, budget_max=3_500_000, deadline=d(45), location='Mombasa Port',
                 status='open'),
            dict(client=cp1, title='Quantity Surveying – Lavington Estate Renovation',
                 description='Full QS services for a 6-bedroom house renovation. Prepare BOQ, tender documents, evaluate contractor bids and provide project cost control throughout.',
                 skills=['Quantity Takeoff', 'Cost Estimation', 'Contract Management'],
                 budget_min=500_000, budget_max=900_000, deadline=d(30), location='Lavington, Nairobi',
                 status='open'),
            dict(client=cp2, title='Structural Design – County Hospital Expansion',
                 description='Structural engineering design for a new 4-storey 80-bed wing to be added to an existing county hospital. Includes foundation assessment of adjoining structure.',
                 skills=['ETABS', 'SAP2000', 'Structural Analysis', 'Foundation Design', 'AutoCAD'],
                 budget_min=6_000_000, budget_max=9_000_000, deadline=d(120), location='Nakuru County',
                 status='open'),
            dict(client=cp1, title='BIM Modelling – Mixed-Use Development',
                 description='Create full BIM model (LOD 300) for a proposed 12-storey mixed-use development in Westlands. Coordinate architectural, structural and MEP models.',
                 skills=['BIM', 'Revit', 'AutoCAD', 'Site Supervision'],
                 budget_min=1_200_000, budget_max=2_000_000, deadline=d(75), location='Westlands, Nairobi',
                 status='open'),
            dict(client=cp2, title='Drainage Master Plan – Kisumu CBD',
                 description='Prepare a stormwater drainage master plan for the Kisumu central business district covering 3.2 km². Includes hydrological analysis, pipe sizing, and GIS mapping.',
                 skills=['Drainage Design', 'Civil 3D', 'GIS', 'Road Design'],
                 budget_min=3_500_000, budget_max=5_500_000, deadline=d(100), location='Kisumu CBD',
                 status='in_progress'),
        ]

        project_objs = []
        for pd in projects_data:
            proj, _ = Project.objects.get_or_create(
                title=pd['title'],
                defaults={k: v for k, v in pd.items() if k != 'title'},
            )
            project_objs.append(proj)

        # Add milestones to first two projects
        ms_project = project_objs[0]
        if not ms_project.milestones.exists():
            for ms in [
                dict(title='Foundation & Substructure', description='Excavation, foundation, and slab work', amount=1_800_000, due_date=d(30)),
                dict(title='Superstructure', description='Walling, roofing and structural work', amount=3_000_000, due_date=d(60)),
                dict(title='Finishes & M&E', description='Plastering, tiling, electrical and plumbing', amount=1_500_000, due_date=d(85)),
            ]:
                Milestone.objects.create(project=ms_project, **ms)

        # ── Bids ──────────────────────────────────────────────────────────────
        bid_scenarios = [
            # (project_idx, engineer_idx, amount, timeline, status)
            (0, 0, 5_800_000, 85, 'pending'),
            (0, 3, 6_200_000, 80, 'pending'),
            (0, 4, 5_500_000, 90, 'pending'),
            (1, 3, 2_100_000, 55, 'accepted'),
            (1, 0, 2_400_000, 50, 'rejected'),
            (2, 1, 32_000_000, 170, 'pending'),
            (3, 5, 2_800_000, 40, 'accepted'),
            (4, 2, 650_000, 28, 'pending'),
            (5, 0, 7_200_000, 110, 'pending'),
            (6, 3, 1_400_000, 70, 'pending'),
        ]
        for pi, ei, amount, timeline, bstatus in bid_scenarios:
            proj    = project_objs[pi]
            eng     = engineer_profiles[ei]
            Bid.objects.get_or_create(
                project=proj, engineer=eng,
                defaults=dict(
                    amount=amount, timeline=timeline, status=bstatus,
                    cover_letter=(
                        f"I have {eng.years_exp} years of experience in {eng.specialization.replace('_', ' ')} "
                        f"and have completed similar projects in {eng.location_city}. "
                        f"I am confident I can deliver this project within the agreed timeline and budget."
                    ),
                ),
            )

        # ── Conversations & Messages ───────────────────────────────────────────
        conv_scenarios = [
            (client_users[0], engineer_users[0], project_objs[0],
             [
                 (client_users[0], "Hi James, I reviewed your bid. Very competitive. Can we discuss the foundation approach?"),
                 (engineer_users[0], "Of course! I recommend a raft foundation given the soil conditions in Karen. Shall we schedule a site visit?"),
                 (client_users[0], "That sounds great. Are you available this Friday morning?"),
                 (engineer_users[0], "Yes, Friday works perfectly. I'll bring the preliminary drawings."),
             ]),
            (client_users[1], engineer_users[1], project_objs[2],
             [
                 (client_users[1], "Grace, we've reviewed the proposals. Your road design experience is impressive."),
                 (engineer_users[1], "Thank you! I've worked on similar corridors in Kisumu and understand the drainage challenges well."),
                 (client_users[1], "Can you share your drainage design methodology?"),
             ]),
        ]
        for cu, eu, proj, msgs in conv_scenarios:
            conv, _ = Conversation.objects.get_or_create(project=proj)
            conv.participants.set([cu, eu])
            if not conv.messages.exists():
                for sender, content in msgs:
                    Message.objects.create(
                        conversation=conv, sender=sender, content=content, is_read=True,
                    )

        # ── Notifications ─────────────────────────────────────────────────────
        notif_data = [
            (engineer_users[0], 'bid_update', 'Bid Accepted', 'Your proposal for "Commercial Office Fit-Out" has been accepted!', f'/projects/{project_objs[1].id}'),
            (engineer_users[0], 'message', 'New message from Amara Osei', 'Hi James, I reviewed your bid. Very competitive...', '/messages/'),
            (engineer_users[2], 'bid_update', 'New Project Match', 'A new project matching your skills was posted: Lavington Estate Renovation', f'/projects/{project_objs[4].id}'),
            (client_users[0], 'bid', 'New Proposal Received', 'Grace Achieng submitted a proposal on "Quantity Surveying – Lavington"', f'/projects/{project_objs[4].id}'),
            (client_users[1], 'bid_accepted', 'Engineer Hired', 'You accepted Caroline Njeri\'s bid for the Mombasa Port project', f'/projects/{project_objs[3].id}'),
        ]
        for recipient, ntype, title, body, link in notif_data:
            Notification.objects.get_or_create(
                recipient=recipient, title=title,
                defaults=dict(notif_type=ntype, body=body, link=link, is_read=False),
            )

        self.stdout.write(self.style.SUCCESS(
            '\n✅  Demo data seeded successfully!\n'
            '\n  Logins (password for all: Demo1234!)\n'
            '  ─────────────────────────────────────────────────\n'
            '  Admin:    admin@buildconnect.co\n'
            '  Client 1: amara.osei@kenyadev.co\n'
            '  Client 2: fatima.wanjiku@infrake.go.ke\n'
            '  Engineer: james.mwangi@buildconnect.co   (Structural)\n'
            '  Engineer: grace.achieng@buildconnect.co  (Civil/Roads)\n'
            '  Engineer: samuel.kipkemoi@buildconnect.co (QS)\n'
            '  Engineer: linda.mutua@buildconnect.co    (Architect)\n'
            '  Engineer: david.otieno@buildconnect.co   (MEP)\n'
            '  Engineer: caroline.njeri@buildconnect.co (Geotechnical)\n'
        ))
