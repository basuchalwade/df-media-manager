
export const generatePostContent = async (topic: string, platform: string, tone: string, context: any) => {
  await new Promise(r => setTimeout(r, 1500)); // Simulate latency
  return `[${tone} Mode] Here is a draft about "${topic}" optimized for ${platform}. 
  
We believe that consistent automation is the key to scaling your digital presence. 🚀 #Growth #Tech`;
};

export const generateHashtags = async (topic: string) => {
  await new Promise(r => setTimeout(r, 800));
  return ['#Growth', '#Tech', '#Innovation', '#AI', '#Future'];
};

export const refinePostContent = async (content: string, instruction: string) => {
  await new Promise(r => setTimeout(r, 1000));
  return `[Optimized] ${content}\n\n(Refined based on: ${instruction})`;
};

export const validateContentSafety = async () => {
  return { safe: true, issues: [] };
};
