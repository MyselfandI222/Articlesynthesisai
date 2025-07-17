import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Zap, Crown, Users, ArrowRight } from "lucide-react";
import PayPalButton from "../components/PayPalButton";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for getting started with AI-powered news synthesis",
      features: [
        "Basic article synthesis",
        "5 searches per day",
        "Source credibility meter",
        "Basic AI writing styles",
        "Standard export formats"
      ],
      icon: Users,
      color: "bg-gray-100 dark:bg-gray-800",
      badgeColor: "bg-gray-500"
    },
    {
      id: "pro-monthly",
      name: "Pro",
      price: 5,
      description: "Monthly billing - cancel anytime",
      features: [
        "Advanced AI synthesis (GPT-4o)",
        "Unlimited searches",
        "All Pro meters (Story Depth, Perspective Compass, Mood)",
        "API access for custom integrations",
        "White-label solutions",
        "Advanced analytics dashboard",
        "Priority support",
        "Advanced export options",
        "Custom AI writing styles",
        "Breaking news alerts"
      ],
      icon: Zap,
      color: "bg-blue-50 dark:bg-blue-900/20",
      badgeColor: "bg-blue-500",
      popular: true,
      billing: "monthly"
    },
    {
      id: "pro-lifetime",
      name: "Pro",
      price: 50,
      description: "One-time payment for lifetime access",
      features: [
        "Everything in Pro Monthly",
        "Lifetime access - no recurring fees",
        "Future feature updates included",
        "Priority customer success manager",
        "Advanced collaboration tools",
        "Custom AI model training"
      ],
      icon: Crown,
      color: "bg-purple-50 dark:bg-purple-900/20",
      badgeColor: "bg-purple-500",
      billing: "lifetime",
      savings: "Save $10 compared to 10 months of Pro Monthly"
    }
  ];

  const handlePaymentSuccess = async (tier: string, paymentData: any) => {
    setIsProcessing(true);
    try {
      const response = await apiRequest("POST", "/api/subscribe", {
        tier,
        paymentDetails: paymentData
      });
      
      if (response.ok) {
        toast({
          title: "Subscription Activated!",
          description: `Welcome to ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier! Your features are now active.`,
        });
        // Refresh the page to update user data
        window.location.reload();
      } else {
        throw new Error("Failed to activate subscription");
      }
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: "There was an issue activating your subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
    setSelectedTier(null);
  };

  const handlePaymentCancel = () => {
    setSelectedTier(null);
  };

  const getCurrentTier = () => {
    if (!user) return "free";
    // subscriptionStatus can be "free", "pro", or "inactive"
    return user.subscriptionStatus === "inactive" ? "free" : (user.subscriptionStatus || "free");
  };

  const currentTier = getCurrentTier();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Unlock the full potential of AI-powered news synthesis with Pro features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentTier = currentTier === plan.id || (currentTier === "pro" && plan.id.startsWith("pro"));
          const isUpgrade = plan.id !== "free" && currentTier === "free";

          return (
            <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className={`${plan.badgeColor} text-white`}>
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <IconComponent className="h-12 w-12 text-current" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">
                      {plan.billing === "monthly" ? "/month" : " lifetime"}
                    </span>
                  )}
                </div>
                {plan.savings && (
                  <div className="mt-2">
                    <span className="text-sm text-green-600 font-medium">
                      {plan.savings}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  {isCurrentTier ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handlePaymentSuccess("free", null)}
                    >
                      Switch to Free
                    </Button>
                  ) : (
                    <>
                      {selectedTier === plan.id ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-center mb-4">
                              Complete your payment to activate {plan.name}
                            </p>
                            <div className="flex justify-center">
                              <PayPalButton
                                amount={plan.price.toString()}
                                currency="USD"
                                intent="CAPTURE"
                                onSuccess={(data) => handlePaymentSuccess(plan.id, data)}
                                onError={handlePaymentError}
                                onCancel={handlePaymentCancel}
                              />
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedTier(null)}
                            disabled={isProcessing}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedTier(plan.id)}
                          disabled={isProcessing}
                        >
                          {isUpgrade ? "Upgrade to " : "Choose "}{plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-300">
          All plans include our core AI synthesis features. Monthly subscriptions can be cancelled anytime.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;