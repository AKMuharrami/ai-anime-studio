import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add import
import_patch = """import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudioHomePage } from './components/StudioHomePage';
import { MangaStudioHomePage } from './components/MangaStudioHomePage';
import { MangaStudioTab } from './components/MangaStudioTab';
import { ScriptTimelineParserTab } from './components/ScriptTimelineParserTab';
import { StudioDesignVaultTab } from './components/StudioDesignVaultTab';
import { SeedanceMultimodalStudioTab } from './components/SeedanceMultimodalStudioTab';
import { SoundVoiceStudioTab } from './components/SoundVoiceStudioTab';
import { TimelineCompilerTab } from './components/TimelineCompilerTab';
import { ProjectRouterModal } from './components/ProjectRouterModal';
import { DatabaseArchitectureModal } from './components/DatabaseArchitectureModal';
import { PythonOrchestrationModal } from './components/PythonOrchestrationModal';
import { WalletTopupModal } from './components/WalletTopupModal';
import { AuthScreen } from './components/AuthScreen';
import { Series, Episode, Character, Environment, Scene, User, ScreenplayData } from './types';
"""
code = re.sub(r'import React, \{ useState, useEffect \} from \'react\';[\s\S]*?import \{ Series, Episode, Character, Environment, Scene, User, ScreenplayData \} from \'\.\/types\';', import_patch, code)

# Update App component to handle authentication state
auth_state = """export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // App State
"""
code = code.replace("export default function App() {\n  // App State", auth_state)

auth_effect = """
  // Load token on mount
  useEffect(() => {
    const token = localStorage.getItem('ais_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser({
          id: userData.id,
          email: userData.email,
          wallet_balance: userData.wallet_balance,
          created_at: userData.created_at || new Date().toISOString()
        });
      } else {
        // Token invalid or expired
        localStorage.removeItem('ais_token');
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (token: string, userData: any) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    setUser({
      id: userData.id,
      email: userData.email,
      wallet_balance: userData.wallet_balance,
      created_at: new Date().toISOString()
    });
  };

  const handleTopup = async (amount: number) => {
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, wallet_balance: data.new_balance }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

"""
code = code.replace("  // Project Creation", auth_effect + "\n  // Project Creation")

# Update handleTopup in the previous code which didn't use fetch
code = re.sub(r'const handleTopup = \(amount: number\) => \{\n    setUser\(prev => \(\{ \.\.\.prev, wallet_balance: prev\.wallet_balance \+ amount \}\)\);\n  \};', "", code)


with open('src/App.tsx', 'w') as f:
    f.write(code)

print("App.tsx patched.")
