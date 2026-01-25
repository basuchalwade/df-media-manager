
/**
 * SIMULATION MODE
 * 
 * The real Google GenAI SDK has been removed to resolve dependency issues.
 * All functions below return mocked data to simulate AI behavior.
 */

export const generatePostContent = async (
  topic: string,
  platform: string,
  tone: string,
  context: {
    scheduledTime?: string;
    platformConstraints?: string;
    brandVoice?: string;
    safetyLevel?: string;
  }
): Promise<string> => {
  // Simulation Delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `[SIMULATION MODE] 
  
Here is a ${tone} post about "${topic}" optimized for ${platform}. 
  
We are excited to share our latest updates regarding ${topic}. This content is auto-generated in simulation mode. 🚀 #Growth #Tech`;
};

export const generatePostVariants = async (
  topic: string,
  platform: string,
  tone: string,
  context: any
): Promise<{ name: string; content: string }[]> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return [
      { name: 'Viral Hook', content: `[SIMULATION] 🤯 You won't believe what we just shipped regarding ${topic}! 🚀` },
      { name: 'Professional', content: `[SIMULATION] We are pleased to announce significant advancements in ${topic}. Read more below.` },
      { name: 'Question', content: `[SIMULATION] How are you handling ${topic} in your workflow? Let's discuss! 👇` },
  ];
};

export const generateHashtags = async (topic: string, content: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return ['#Simulation', '#Growth', '#Tech', '#AI', '#Future'];
};

export const validateContentSafety = async (content: string, platforms: string[]): Promise<{ safe: boolean; issues: string[] }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple mock logic: flag specific keywords for testing
  if (content.toLowerCase().includes('unsafe') || content.toLowerCase().includes('fail')) {
      return { 
          safe: false, 
          issues: ['Simulated Safety Flag: Content contains restricted keywords.', 'Harmful content detected.'] 
      };
  }
  
  return { safe: true, issues: [] };
};

export const refinePostContent = async (
  currentContent: string,
  instruction: string,
  platform?: string
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `[OPTIMIZED] ${currentContent} \n\n(Refined for ${platform || 'General'} based on instruction: "${instruction}")`;
};
