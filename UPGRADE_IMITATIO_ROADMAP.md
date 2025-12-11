# Imitatio
### *ex. The Portfolio League*

---

## Vision Statement

**Transform passive portfolio observation into active competitive strategy.**

Imitatio is a platform that applies the classical principle of *imitatio*—learning through emulation of masters—to on-chain portfolio strategy. Users discover, study, and compete to best adapt the strategies of proven crypto wallets and funds, turning the art of portfolio management into a skill-building competitive game.

---

## Core Concept

In classical rhetoric and art education, *imitatio* was the practice of studying and emulating the works of masters to develop one's own skills. Imitatio brings this principle to DeFi:

- **Discover Masters**: Find high-performing wallets and funds across DeFi narratives
- **Study Strategy**: Analyze portfolio composition, timing, and risk management
- **Compete to Adapt**: Build your own portfolios inspired by masters and compete with others
- **Develop Skill**: Learn the principles behind successful strategies through practice

The platform evolves from passive leaderboard watching to active strategy development and competition.

---

## Current Architecture Reference

The existing Portfolio League codebase provides a foundation for Imitatio:

| Component | Location | Purpose |
|-----------|----------|---------|
| Competition Engine | `src/lib/competitions.ts` | Multi-timeframe competition logic (daily, 3-day, weekly, monthly) |
| Scoring System | `src/lib/scoring.ts` | Weighted portfolio return calculations |
| Portfolio Builder | `src/components/portfolio/PortfolioBuilder.tsx` | Asset allocation UI |
| Leaderboard | `src/components/leaderboard/` | Ranking and comparison views |
| Achievement System | `src/lib/achievements.ts` | Gamification mechanics |
| Trophy Contracts | `contracts/PortfolioLeagueTrophies.sol` | On-chain NFT rewards |

---

## Phase 1: Foundation & Rebrand

**Timeline**: Week 1-2  
**Status**: 🔴 Not Started

### Objectives
Transform the Portfolio League brand into Imitatio while maintaining core functionality.

### Tasks

#### 1.1 Brand Identity Update
- [ ] Design new Imitatio logo (classical/modern hybrid aesthetic)
- [ ] Create updated icon set (app icon, favicon, social icons)
- [ ] Define new color palette (consider classical-inspired colors)
- [ ] Update typography guidelines

#### 1.2 Asset Updates
- [ ] Replace `public/logo.svg` with Imitatio logo
- [ ] Update `public/favicon.svg` and `public/icon-512.png`
- [ ] Create new `public/og.svg` for social sharing
- [ ] Update `public/splash.png` for PWA

#### 1.3 Copy & Messaging
- [ ] Rewrite app title and tagline throughout `src/app/layout.tsx`
- [ ] Update homepage copy in `src/app/page.tsx` and `src/app/home-client.tsx`
- [ ] Revise "How to Play" page at `src/app/how-to-play/page.tsx`
- [ ] Update FAQ content at `src/app/faq/page.tsx`
- [ ] Revise terms at `src/app/terms/page.tsx`

#### 1.4 Technical Updates
- [ ] Update `package.json` name from "portfolio-league" to "imitatio"
- [ ] Update `public/site.webmanifest` with new app name and icons
- [ ] Update `minikit.config.ts` configuration
- [ ] Update meta tags across all pages
- [ ] Update Farcaster frame configuration in `src/app/.well-known/farcaster.json/route.ts`

### Deliverables
- Complete rebrand deployed to production
- All user-facing copy reflects Imitatio identity
- Social sharing generates Imitatio-branded previews

---

## Phase 2: Master Portfolio Discovery

**Timeline**: Week 3-6  
**Status**: 🔴 Not Started

### Objectives
Build a system to discover, index, and track high-performing wallets ("Masters") across DeFi.

### Tasks

#### 2.1 Wallet Discovery System
- [ ] Design Master wallet data schema
- [ ] Integrate wallet tracking APIs (Dune, Arkham, Nansen, etc.)
- [ ] Build wallet discovery pipeline
- [ ] Create curation system for verified Masters
- [ ] Implement wallet labeling and metadata storage

#### 2.2 Master Portfolio Indexing
- [ ] Real-time portfolio composition tracking
- [ ] Historical portfolio snapshots
- [ ] Transaction history indexing
- [ ] Position entry/exit detection
- [ ] Create `src/lib/masters.ts` for master wallet utilities

#### 2.3 Performance Metrics
- [ ] Calculate Master wallet returns (1D, 7D, 30D, 1Y)
- [ ] Risk-adjusted performance (Sharpe ratio, max drawdown)
- [ ] Win rate and trade frequency metrics
- [ ] Portfolio volatility tracking
- [ ] Add Master performance scoring to `src/lib/scoring.ts`

#### 2.4 DeFi Narrative Categorization
- [ ] Define narrative categories:
  - Yield Farming / DeFi Blue Chips
  - NFT Trading & Collections
  - Memecoin Alpha
  - L2 Ecosystem Plays
  - RWA & Stables
  - Degen / High Risk
- [ ] Auto-categorization based on holdings
- [ ] Manual curation for featured Masters
- [ ] Create `src/lib/narratives.ts`

#### 2.5 Master Discovery UI
- [ ] Create Master browser page at `src/app/masters/page.tsx`
- [ ] Master detail page at `src/app/masters/[address]/page.tsx`
- [ ] Filter by narrative, performance, risk level
- [ ] Master search functionality
- [ ] "Follow" system for favorite Masters

### Deliverables
- Master wallet database with 100+ indexed wallets
- Real-time portfolio tracking for all Masters
- Narrative-based discovery UI
- Performance leaderboard for Masters

---

## Phase 3: Competitive Emulation Engine

**Timeline**: Week 7-12  
**Status**: 🔴 Not Started

### Objectives
Create the core competitive loop where users build portfolios inspired by Masters and compete.

### Tasks

#### 3.1 Emulation Mechanics
- [ ] "Emulate This Master" flow from Master profiles
- [ ] One-click portfolio template from Master holdings
- [ ] Customization layer for user adaptations
- [ ] Entry price locking at emulation start
- [ ] Extend `src/components/portfolio/PortfolioBuilder.tsx`

#### 3.2 Strategy Adaptation Scoring
- [ ] Calculate "Adaptation Score" - how well user adapted Master strategy
- [ ] Measure deviation from Master portfolio
- [ ] Time-weighted performance vs. Master
- [ ] Create `src/lib/adaptation.ts`

#### 3.3 Risk-Adjusted Calculations
- [ ] Sharpe ratio calculations for user portfolios
- [ ] Maximum drawdown tracking
- [ ] Volatility-adjusted returns
- [ ] Risk score display in leaderboards
- [ ] Extend `src/lib/scoring.ts` with risk metrics

#### 3.4 League Structure
Extend `src/lib/competitions.ts`:

```typescript
export type LeagueType = 
  | 'open'           // Anyone can join
  | 'narrative'      // Specific to a DeFi narrative  
  | 'master-follow'  // All emulating same Master
  | 'risk-tier'      // Grouped by risk tolerance
  | 'invite';        // Private leagues
```

- [ ] Narrative-based leagues (Memecoin League, DeFi League, etc.)
- [ ] Master-specific leagues (Compete emulating same Master)
- [ ] Risk-tiered leagues (Conservative, Moderate, Aggressive)
- [ ] Custom/invite-only leagues
- [ ] League creation and management UI

#### 3.5 Competition Windows
- [ ] Maintain existing timeframes (Daily, 3-Day, Weekly, Monthly)
- [ ] Add "Season" competitions (3 months)
- [ ] Flash competitions (1-hour, 4-hour)
- [ ] Event-based competitions (Token launches, etc.)

### Deliverables
- Full emulation flow from Master to competition entry
- Adaptation scoring system
- Risk-adjusted leaderboards
- Multiple league types operational

---

## Phase 4: Skill Development Tools

**Timeline**: Week 13-18  
**Status**: 🔴 Not Started

### Objectives
Transform Imitatio from a competition platform into a learning platform.

### Tasks

#### 4.1 Deep Structural Analysis
- [ ] Master portfolio composition breakdown
- [ ] Sector/narrative allocation visualization
- [ ] Correlation analysis between holdings
- [ ] Historical allocation changes timeline
- [ ] Create `src/components/analysis/` directory

#### 4.2 Strategy Breakdown Views
- [ ] Entry/exit timing analysis
- [ ] Position sizing patterns
- [ ] Rebalancing frequency
- [ ] Reaction to market events
- [ ] "Strategy DNA" profiles for Masters

#### 4.3 Learning Resources
- [ ] Contextual tooltips explaining metrics
- [ ] Strategy pattern library
- [ ] Video tutorials (embedded)
- [ ] Weekly strategy breakdowns
- [ ] Create `src/app/learn/` routes

#### 4.4 Performance Comparison Tools
- [ ] Side-by-side Master comparison
- [ ] User vs. Master performance overlay
- [ ] Historical "what if" simulations
- [ ] Extend `src/app/compare/page.tsx`

#### 4.5 AI Strategy Coach
Extend `src/lib/ai-coach.ts`:
- [ ] Personalized improvement suggestions
- [ ] Pattern recognition in user portfolios
- [ ] Risk warnings and diversification tips
- [ ] Strategy recommendations based on Masters

### Deliverables
- Comprehensive analysis dashboard
- Learning resource library
- Enhanced AI coach with Master-aware suggestions
- Comparison and simulation tools

---

## Phase 5: Gamification & Rewards

**Timeline**: Week 19-24  
**Status**: 🔴 Not Started

### Objectives
Deepen engagement through gamification and valuable rewards.

### Tasks

#### 5.1 Ranking System Evolution
- [ ] Tiered ranking system (Bronze → Diamond)
- [ ] Narrative-specific rankings
- [ ] Skill-based matchmaking for leagues
- [ ] Season-over-season rank progression
- [ ] Create `src/lib/rankings.ts`

#### 5.2 Achievement System Expansion
Extend `src/lib/achievements.ts`:
- [ ] Master-based achievements ("First Emulation", "Perfect Adaptation")
- [ ] Streak achievements
- [ ] Narrative mastery badges
- [ ] Social achievements (referrals, community)
- [ ] Hidden/secret achievements

#### 5.3 NFT Trophy System
Extend `contracts/PortfolioLeagueTrophies.sol`:
- [ ] Seasonal champion trophies
- [ ] Narrative-specific trophies
- [ ] "Perfect Emulation" special editions
- [ ] Evolving NFTs based on performance
- [ ] Trophy showcase on profiles

#### 5.4 Prize Pool Mechanics
- [ ] Transparent prize pool display
- [ ] Entry fee structures (optional)
- [ ] Sponsor-funded prize pools
- [ ] Token reward distributions
- [ ] Revenue sharing with top performers

#### 5.5 Streaks & Consistency Rewards
- [ ] Daily participation streaks
- [ ] Win streaks with multipliers
- [ ] Consistency badges
- [ ] Comeback rewards

### Deliverables
- Complete ranking tier system
- 50+ achievements
- NFT trophy system with on-chain minting
- Prize pool infrastructure

---

## Phase 6: Advanced Features & Scale

**Timeline**: Week 25-36  
**Status**: 🔴 Not Started

### Objectives
Scale the platform with advanced features and broader reach.

### Tasks

#### 6.1 Multi-Chain Master Support
- [ ] Ethereum mainnet integration
- [ ] Base (primary chain)
- [ ] Arbitrum
- [ ] Optimism
- [ ] Polygon
- [ ] Solana (if applicable)
- [ ] Cross-chain portfolio aggregation
- [ ] Unified Master profiles across chains

#### 6.2 Advanced Analytics Dashboard
- [ ] Portfolio health score
- [ ] Risk decomposition charts
- [ ] Correlation matrices
- [ ] Performance attribution
- [ ] Custom date range analysis
- [ ] Export functionality (CSV, PDF)
- [ ] Create `src/app/analytics/` routes

#### 6.3 Social Features
- [ ] Follow Masters with notifications
- [ ] Share strategy adaptations
- [ ] Discussion threads on Master profiles
- [ ] Strategy communities
- [ ] Extend `src/lib/notifications.ts`

#### 6.4 API for Third-Party Integrations
- [ ] Public API for Master data
- [ ] Webhook subscriptions for Master moves
- [ ] OAuth for third-party apps
- [ ] Rate limiting and API keys
- [ ] Create `src/app/api/v1/` routes

#### 6.5 Performance Optimizations
- [ ] Redis caching improvements in `src/lib/redis.ts`
- [ ] Real-time WebSocket updates
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Load testing and scaling

### Deliverables
- 5+ chains supported
- Public API with documentation
- Enhanced social features
- Platform handles 100K+ users

---

## Phase 7: Ecosystem Growth

**Timeline**: Week 37-52  
**Status**: 🔴 Not Started

### Objectives
Build a sustainable, community-driven ecosystem.

### Tasks

#### 7.1 Community Governance
- [ ] $IMITATIO token design (if applicable)
- [ ] Governance proposal system
- [ ] Voting on featured Masters
- [ ] Community treasury management
- [ ] Create `src/app/governance/` routes

#### 7.2 Master Wallet Partnerships
- [ ] Outreach program for verified Masters
- [ ] Revenue sharing for featured Masters
- [ ] Exclusive Master content/alpha
- [ ] Master "office hours" events
- [ ] Master verification badge system

#### 7.3 Educational Content Program
- [ ] Weekly strategy newsletters
- [ ] Podcast/video series
- [ ] Guest Master sessions
- [ ] Community-contributed tutorials
- [ ] Certification programs

#### 7.4 Long-Term Sustainability Model
- [ ] Freemium tier structure
- [ ] Premium features definition
- [ ] Subscription model (if applicable)
- [ ] B2B/institutional offerings
- [ ] Protocol fee structure

#### 7.5 Ecosystem Expansion
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Telegram bot integration
- [ ] Discord bot
- [ ] Farcaster mini-app expansion

### Deliverables
- Active governance system
- 10+ partnered Masters
- Educational content library
- Sustainable revenue model
- Multi-platform presence

---

## Technical Debt & Infrastructure

### Ongoing Priorities

#### Code Quality
- [ ] Migrate to stricter TypeScript configuration
- [ ] Comprehensive test coverage (unit, integration, e2e)
- [ ] Error monitoring (Sentry integration)
- [ ] Logging and observability

#### Security
- [ ] Smart contract audits for trophy system
- [ ] API security review
- [ ] Rate limiting and DDoS protection
- [ ] Wallet connection security audit

#### DevOps
- [ ] CI/CD pipeline improvements
- [ ] Staging environment
- [ ] Database backup and recovery
- [ ] Monitoring dashboards

---

## Success Metrics

| Phase | Key Metrics | Target |
|-------|------------|--------|
| Phase 1 | Rebrand completion | 100% assets updated |
| Phase 2 | Masters indexed | 100+ wallets |
| Phase 3 | Active competitions | 10+ concurrent leagues |
| Phase 4 | Learning engagement | 50% users view analysis |
| Phase 5 | NFT trophies minted | 1,000+ |
| Phase 6 | API integrations | 5+ third-party apps |
| Phase 7 | Governance participation | 20% token holder voting |

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| Master wallet data reliability | Multiple data source redundancy |
| Front-running of Master trades | Delayed trade publication |
| Regulatory concerns | Emphasize educational/game aspect |
| User churn | Strong gamification and rewards |
| Scaling issues | Progressive rollout, load testing |

---

## Appendix: File Structure Changes

```
portfolio-league/ → imitatio/
├── src/
│   ├── app/
│   │   ├── masters/              # NEW: Master discovery
│   │   │   ├── page.tsx
│   │   │   └── [address]/
│   │   │       └── page.tsx
│   │   ├── learn/                # NEW: Learning resources
│   │   │   └── page.tsx
│   │   ├── analytics/            # NEW: Advanced analytics
│   │   │   └── page.tsx
│   │   ├── governance/           # NEW: Community governance
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── v1/               # NEW: Public API
│   │           └── ...
│   ├── components/
│   │   ├── analysis/             # NEW: Analysis components
│   │   │   └── ...
│   │   └── masters/              # NEW: Master UI components
│   │       └── ...
│   └── lib/
│       ├── masters.ts            # NEW: Master wallet utilities
│       ├── narratives.ts         # NEW: Narrative categorization
│       ├── adaptation.ts         # NEW: Adaptation scoring
│       └── rankings.ts           # NEW: Ranking system
└── contracts/
    └── Imitatio*.sol             # Updated contract names
```

---

*Last Updated: December 2024*  
*Version: 1.0.0*
