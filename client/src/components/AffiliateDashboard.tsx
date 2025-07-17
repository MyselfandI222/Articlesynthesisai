import React, { useState, useEffect } from 'react';
import { Users, Link, TrendingUp, DollarSign, Copy, Check, Share2, Gift, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface AffiliateStats {
  totalReferrals: number;
  referrals: { username: string; createdAt: string }[];
  rewards: { rewardType: string; rewardAmount: number; status: string; createdAt: string }[];
  clickCount: number;
  conversions: number;
  totalEarnings: number;
}

interface AffiliateLink {
  affiliateCode: string;
  affiliateLink: string;
  shortLink: string;
}

const AffiliateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      const [linkResponse, statsResponse] = await Promise.all([
        apiRequest('GET', '/api/affiliate/link'),
        apiRequest('GET', '/api/affiliate/stats')
      ]);

      const linkData = await linkResponse.json();
      const statsData = await statsResponse.json();

      setAffiliateLink(linkData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affiliate data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: 'Copied!',
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const shareViaEmail = () => {
    const subject = 'Check out this amazing AI article synthesis tool!';
    const body = `I've been using this incredible AI-powered article synthesis platform that combines multiple news sources into original, engaging content. 

Sign up with my referral link and we both get 20% off premium features!

${affiliateLink?.affiliateLink}

Features include:
• AI-powered article synthesis from multiple sources
• Source credibility analysis
• Advanced writing styles and tones
• Real-time news aggregation
• Export capabilities

Perfect for content creators, journalists, and businesses!`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaTwitter = () => {
    const text = `🚀 Discovered an amazing AI article synthesis tool! It combines multiple news sources into original, engaging content. Sign up with my link for 20% off premium features! ${affiliateLink?.shortLink} #AI #ContentCreation #News`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    const text = `I've been using this incredible AI-powered article synthesis platform that transforms multiple news sources into original, engaging content. Perfect for content creators and businesses! Sign up with my referral link for exclusive benefits.`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(affiliateLink?.affiliateLink || '')}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const conversionRate = stats?.clickCount ? ((stats.conversions / stats.clickCount) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2">Affiliate Marketing Dashboard</h1>
        <p className="text-blue-100">
          Earn 20% discounts on premium features by referring new users to our platform!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Link Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.clickCount || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Link className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Rewards</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.rewards?.filter(r => r.status === 'pending').length || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Gift className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Affiliate Links</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Referral Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={affiliateLink?.affiliateLink || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(affiliateLink?.affiliateLink || '', 'Full link')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                {copied === 'Full link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm">{copied === 'Full link' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={affiliateLink?.shortLink || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(affiliateLink?.shortLink || '', 'Short link')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                {copied === 'Short link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm">{copied === 'Short link' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affiliate Code
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={affiliateLink?.affiliateCode || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(affiliateLink?.affiliateCode || '', 'Affiliate code')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                {copied === 'Affiliate code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm">{copied === 'Affiliate code' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share & Earn</h2>
        <p className="text-gray-600 mb-6">
          Share your referral link on social media, email, or directly with friends to start earning rewards!
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={shareViaEmail}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share via Email</span>
          </button>
          
          <button
            onClick={shareViaTwitter}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share on Twitter</span>
          </button>
          
          <button
            onClick={shareViaLinkedIn}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share on LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Rewards */}
      {stats?.rewards && stats.rewards.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rewards</h2>
          <div className="space-y-3">
            {stats.rewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Gift className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {reward.rewardAmount}% discount reward
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    reward.status === 'applied' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reward.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Referrals</h2>
          <div className="space-y-3">
            {stats.referrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.username}</p>
                    <p className="text-sm text-gray-600">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="bg-green-100 p-1 rounded-full">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">How Affiliate Marketing Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Share Your Link</h3>
            <p className="text-sm text-blue-800">
              Share your unique referral link with friends, on social media, or through email.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Friend Signs Up</h3>
            <p className="text-sm text-blue-800">
              When someone clicks your link and creates an account, they become your referral.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Earn Rewards</h3>
            <p className="text-sm text-blue-800">
              You get 20% off your premium subscription for each successful referral!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;