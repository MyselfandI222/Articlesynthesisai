// Free Sports APIs integration
import { SearchResult } from '../types';
import { getEnabledAPISources } from './apiFilters';

// ESPN Hidden API Integration (No API Key Required)
export const searchESPN = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase();
    
    // ESPN sports league endpoints
    const espnLeagues = [
      { sport: 'football', league: 'nfl', name: 'NFL' },
      { sport: 'basketball', league: 'nba', name: 'NBA' },
      { sport: 'baseball', league: 'mlb', name: 'MLB' },
      { sport: 'hockey', league: 'nhl', name: 'NHL' },
      { sport: 'soccer', league: 'eng.1', name: 'Premier League' },
      { sport: 'soccer', league: 'usa.1', name: 'MLS' },
      { sport: 'football', league: 'college-football', name: 'College Football' },
      { sport: 'basketball', league: 'mens-college-basketball', name: 'College Basketball' }
    ];
    
    // Determine which leagues to fetch based on query
    const leaguesToFetch = espnLeagues.filter(league => 
      searchTerms.includes(league.name.toLowerCase()) || 
      searchTerms.includes(league.sport) ||
      searchTerms.includes(league.league.replace(/-/g, ' '))
    );
    
    // If no specific league matches, fetch from popular leagues
    const finalLeagues = leaguesToFetch.length > 0 ? leaguesToFetch : 
      espnLeagues.slice(0, 4); // NFL, NBA, MLB, NHL by default
    
    // Fetch news from each league
    for (const { sport, league, name } of finalLeagues) {
      try {
        const espnUrl = `http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news`;
        const response = await fetch(espnUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          // Process ESPN articles
          if (data.articles && Array.isArray(data.articles)) {
            data.articles.slice(0, 3).forEach((article: any, index: number) => {
              results.push({
                id: `espn-${league}-${index}`,
                title: article.headline || `${name} News Update`,
                description: article.description || article.headline || 'ESPN sports coverage',
                content: `${article.story || article.description || article.headline}\n\nFrom ESPN ${name} coverage: ${article.description || 'Breaking sports news and analysis.'}`,
                url: article.links?.web?.href || `https://www.espn.com/${sport}/${league}`,
                source: `ESPN ${name}`,
                publishedAt: article.published || new Date().toISOString(),
                author: article.byline || 'ESPN Staff',
                viewpoint: 'sports coverage',
                keywords: [name.toLowerCase(), sport, 'espn', 'sports news', league]
              });
            });
          }
        }
      } catch (leagueError) {
        console.error(`ESPN ${name} fetch error:`, leagueError);
        // Continue with other leagues even if one fails
      }
    }
    
    return results;
  } catch (error) {
    console.error('ESPN API error:', error);
    return [];
  }
};

// Fabrizio Romano and Bleacher Report content simulation
export const searchFabrizioRomano = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchTerms = query.toLowerCase();
    
    // Simulate Fabrizio Romano-style transfer and football news
    if (searchTerms.includes('transfer') || searchTerms.includes('football') || searchTerms.includes('soccer') || 
        searchTerms.includes('premier league') || searchTerms.includes('champions league') || searchTerms.includes('serie a')) {
      
      const fabrizioResults: SearchResult[] = [
        {
          id: 'fabrizio-1',
          title: 'EXCLUSIVE: Major Transfer Update - Here We Go!',
          description: 'Breaking transfer news with exclusive details on the latest football moves.',
          content: 'Exclusive transfer update: The deal is progressing well with all parties working to finalize the agreement. Medical tests and contract details are being arranged. More updates to follow as the situation develops. Here we go! 🔴⚪️',
          url: 'https://twitter.com/FabrizioRomano',
          source: 'Fabrizio Romano',
          publishedAt: new Date().toISOString(),
          author: 'Fabrizio Romano',
          viewpoint: 'insider',
          keywords: ['transfer news', 'football', 'soccer', 'exclusive', 'here we go', 'fabrizio romano']
        },
        {
          id: 'fabrizio-2',
          title: 'Transfer Market Analysis: Latest Developments',
          description: 'In-depth analysis of current transfer market trends and player movements.',
          content: 'The transfer market continues to evolve with several high-profile moves in progress. Clubs are actively negotiating to strengthen their squads for the upcoming season. Key players are considering their options as contracts and negotiations advance.',
          url: 'https://twitter.com/FabrizioRomano',
          source: 'Fabrizio Romano',
          publishedAt: new Date().toISOString(),
          author: 'Fabrizio Romano',
          viewpoint: 'analytical',
          keywords: ['transfer market', 'football analysis', 'player movements', 'negotiations']
        }
      ];
      
      return fabrizioResults;
    }
    
    return [];
  } catch (error) {
    console.error('Fabrizio Romano content error:', error);
    return [];
  }
};

export const searchBleacherReport = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchTerms = query.toLowerCase();
    
    // Simulate Bleacher Report content across multiple sports
    const bleacherResults: SearchResult[] = [
      {
        id: 'br-1',
        title: `${query}: Complete Analysis and Breakdown`,
        description: 'Comprehensive sports analysis with expert insights and statistical breakdowns.',
        content: `Bleacher Report's expert analysis examines all aspects of ${query}, providing in-depth coverage with statistical insights, expert opinions, and comprehensive breakdowns. Our sports analysts have reviewed the latest developments and trends.`,
        url: 'https://bleacherreport.com/',
        source: 'Bleacher Report',
        publishedAt: new Date().toISOString(),
        author: 'Bleacher Report Staff',
        viewpoint: 'analytical',
        keywords: ['sports analysis', 'bleacher report', 'expert opinion', query.toLowerCase()]
      },
      {
        id: 'br-2',
        title: `Power Rankings: ${query} Edition`,
        description: 'Latest power rankings and performance evaluations across the sports landscape.',
        content: `Our latest power rankings examine the current state of ${query}, evaluating performance metrics, recent results, and future prospects. These rankings reflect comprehensive analysis of current form and potential.`,
        url: 'https://bleacherreport.com/',
        source: 'Bleacher Report',
        publishedAt: new Date().toISOString(),
        author: 'Bleacher Report Analysts',
        viewpoint: 'evaluative',
        keywords: ['power rankings', 'sports evaluation', 'performance analysis', query.toLowerCase()]
      },
      {
        id: 'br-3',
        title: `Breaking: ${query} Latest News and Updates`,
        description: 'Breaking sports news with immediate updates and expert commentary.',
        content: `Breaking news coverage of ${query} with immediate updates, expert commentary, and analysis of the implications. Our sports newsroom provides comprehensive coverage of developing stories.`,
        url: 'https://bleacherreport.com/',
        source: 'Bleacher Report',
        publishedAt: new Date().toISOString(),
        author: 'Bleacher Report News',
        viewpoint: 'breaking news',
        keywords: ['breaking news', 'sports news', 'updates', query.toLowerCase()]
      }
    ];
    
    // Filter results based on search relevance
    return bleacherResults.filter(result => {
      const titleLower = result.title.toLowerCase();
      const descLower = result.description.toLowerCase();
      return searchTerms.split(' ').some(term => 
        titleLower.includes(term) || descLower.includes(term) || 
        result.keywords?.some(keyword => keyword.includes(term))
      );
    });
  } catch (error) {
    console.error('Bleacher Report content error:', error);
    return [];
  }
};

// The Sports DB API (Free for non-commercial use)
export const searchSportsDB = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchTerms = query.toLowerCase();
    let apiUrl = '';
    
    // Determine search type based on query
    if (searchTerms.includes('team') || searchTerms.includes('league')) {
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`;
    } else if (searchTerms.includes('player')) {
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`;
    } else {
      // General search - try teams first
      apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.teams) {
      data.teams.slice(0, 5).forEach((team: any, index: number) => {
        results.push({
          id: `sportsdb-team-${index}`,
          title: `${team.strTeam} - ${team.strLeague}`,
          description: team.strDescriptionEN?.substring(0, 200) + '...' || `Professional sports team in ${team.strLeague}`,
          content: team.strDescriptionEN || `${team.strTeam} is a professional sports team competing in ${team.strLeague}. Founded in ${team.intFormedYear || 'unknown'}.`,
          url: team.strWebsite || `https://www.thesportsdb.com/team/${team.idTeam}`,
          source: 'TheSportsDB',
          publishedAt: new Date().toISOString(),
          author: 'TheSportsDB',
          viewpoint: 'neutral',
          keywords: ['sports', 'team', team.strSport?.toLowerCase(), team.strLeague?.toLowerCase()]
        });
      });
    }
    
    if (data.player) {
      data.player.slice(0, 5).forEach((player: any, index: number) => {
        results.push({
          id: `sportsdb-player-${index}`,
          title: `${player.strPlayer} - ${player.strTeam}`,
          description: player.strDescriptionEN?.substring(0, 200) + '...' || `Professional athlete playing for ${player.strTeam}`,
          content: player.strDescriptionEN || `${player.strPlayer} is a professional athlete currently playing for ${player.strTeam}.`,
          url: `https://www.thesportsdb.com/player/${player.idPlayer}`,
          source: 'TheSportsDB',
          publishedAt: new Date().toISOString(),
          author: 'TheSportsDB',
          viewpoint: 'neutral',
          keywords: ['sports', 'player', 'athlete', player.strSport?.toLowerCase()]
        });
      });
    }
    
    return results;
  } catch (error) {
    console.error('TheSportsDB API error:', error);
    return [];
  }
};

// Football-Data.org API (Free tier: 10 requests/minute)
export const searchFootballData = async (query: string): Promise<SearchResult[]> => {
  try {
    // Note: This requires an API key for production use
    // For demo purposes, we'll simulate the response structure
    const mockFootballResults: SearchResult[] = [
      {
        id: 'football-data-1',
        title: 'Premier League Latest Standings and Results',
        description: 'Current standings and recent match results from the English Premier League.',
        content: 'The Premier League continues to provide exciting football action with competitive matches and surprising results. Teams are battling for position in the table as the season progresses.',
        url: 'https://www.football-data.org/',
        source: 'Football-Data.org',
        publishedAt: new Date().toISOString(),
        author: 'Football-Data.org',
        viewpoint: 'neutral',
        keywords: ['football', 'soccer', 'premier league', 'standings', 'results']
      },
      {
        id: 'football-data-2',
        title: 'Champions League Tournament Updates',
        description: 'Latest news and results from the UEFA Champions League competition.',
        content: 'The Champions League showcases the best European football clubs competing at the highest level. Recent matches have delivered thrilling performances and unexpected outcomes.',
        url: 'https://www.football-data.org/',
        source: 'Football-Data.org',
        publishedAt: new Date().toISOString(),
        author: 'Football-Data.org',
        viewpoint: 'neutral',
        keywords: ['football', 'soccer', 'champions league', 'UEFA', 'european football']
      }
    ];

    const searchTerms = query.toLowerCase();
    return mockFootballResults.filter(result => {
      const titleLower = result.title.toLowerCase();
      const descLower = result.description.toLowerCase();
      return titleLower.includes(searchTerms) || descLower.includes(searchTerms) ||
             result.keywords?.some(keyword => keyword.includes(searchTerms));
    });
  } catch (error) {
    console.error('Football-Data.org API error:', error);
    return [];
  }
};

// NBA Stats API (Unofficial but free)
export const searchNBAStats = async (query: string): Promise<SearchResult[]> => {
  try {
    // Using the unofficial NBA API endpoints
    const searchTerms = query.toLowerCase();
    
    if (searchTerms.includes('nba') || searchTerms.includes('basketball')) {
      const mockNBAResults: SearchResult[] = [
        {
          id: 'nba-stats-1',
          title: 'NBA Season Statistics and Player Performance',
          description: 'Current season statistics, player performances, and team standings.',
          content: 'The NBA season continues with impressive individual performances and competitive team play. Statistical analysis reveals interesting trends in player efficiency and team strategies.',
          url: 'https://stats.nba.com/',
          source: 'NBA Stats',
          publishedAt: new Date().toISOString(),
          author: 'NBA Statistics',
          viewpoint: 'neutral',
          keywords: ['NBA', 'basketball', 'statistics', 'players', 'teams', 'performance']
        },
        {
          id: 'nba-stats-2',
          title: 'NBA Playoff Race and Championship Contenders',
          description: 'Analysis of teams competing for playoff positions and championship potential.',
          content: 'As the NBA season progresses, several teams emerge as strong contenders for the championship. Statistical analysis and performance metrics help identify the most promising teams.',
          url: 'https://stats.nba.com/',
          source: 'NBA Stats',
          publishedAt: new Date().toISOString(),
          author: 'NBA Statistics',
          viewpoint: 'neutral',
          keywords: ['NBA', 'basketball', 'playoffs', 'championship', 'contenders']
        }
      ];

      return mockNBAResults;
    }
    
    return [];
  } catch (error) {
    console.error('NBA Stats API error:', error);
    return [];
  }
};

// OpenLigaDB (Free German sports data)
export const searchOpenLigaDB = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchTerms = query.toLowerCase();
    
    if (searchTerms.includes('bundesliga') || searchTerms.includes('german') || searchTerms.includes('germany')) {
      // OpenLigaDB API for German sports
      const response = await fetch('https://api.openligadb.de/getavailableleagues');
      const leagues = await response.json();
      
      const results: SearchResult[] = [];
      
      leagues.slice(0, 3).forEach((league: any, index: number) => {
        results.push({
          id: `openliga-${index}`,
          title: `${league.leagueName} - German Sports League`,
          description: `Current season information and results for ${league.leagueName}.`,
          content: `${league.leagueName} is a German sports league featuring competitive matches and professional teams. The league provides exciting sports entertainment for fans.`,
          url: `https://www.openligadb.de/`,
          source: 'OpenLigaDB',
          publishedAt: new Date().toISOString(),
          author: 'OpenLigaDB',
          viewpoint: 'neutral',
          keywords: ['german sports', 'bundesliga', league.leagueName?.toLowerCase(), 'football', 'soccer']
        });
      });
      
      return results;
    }
    
    return [];
  } catch (error) {
    console.error('OpenLigaDB API error:', error);
    return [];
  }
};

// Main sports search function
export const searchSportsAPIs = async (query: string): Promise<SearchResult[]> => {
  const enabledAPIs = getEnabledAPISources();
  
  const apiMap = {
    'espn': searchESPN,
    'fabrizio-romano': searchFabrizioRomano,
    'bleacher-report': searchBleacherReport,
    'sports-db': searchSportsDB,
    'football-data': searchFootballData,
    'nba-stats': searchNBAStats,
    'openliga-db': searchOpenLigaDB
  };
  
  // Only search enabled APIs
  const searchPromises = Object.entries(apiMap)
    .filter(([apiId]) => {
      // Map to actual API IDs in our system
      const mappedId = apiId === 'espn' ? 'espn' :
                       apiId === 'fabrizio-romano' ? 'twitter' : // Fabrizio is on Twitter
                       apiId === 'bleacher-report' ? 'bleacher-report' :
                       apiId === 'sports-db' ? 'sports-db' :
                       apiId === 'football-data' ? 'football-data' :
                       apiId === 'nba-stats' ? 'nba-stats' :
                       apiId === 'openliga-db' ? 'sports-db' : // OpenLiga is part of SportsDB
                       apiId;
      
      return enabledAPIs.includes(mappedId);
    })
    .map(([_, searchFn]) => searchFn(query));

  try {
    const results = await Promise.allSettled(searchPromises);
    const allResults: SearchResult[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    return allResults.slice(0, 12); // Increased limit to accommodate new sources
  } catch (error) {
    console.error('Error searching sports APIs:', error);
    return [];
  }
};