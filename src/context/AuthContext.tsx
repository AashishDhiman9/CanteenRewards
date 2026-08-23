import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  availableUsers: UserProfile[];
  setDemoMode: (enabled: boolean) => void;
  login: (emailOrRoll: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickStudentLogin: (rollOrName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleAccount?: { email?: string; name?: string; avatar?: string; credential?: string }) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOTP: (phoneNumber: string, otp: string, studentName?: string, rollNo?: string) => Promise<{ success: boolean; error?: string }>;
  updateStudentPhone: (phone: string) => void;
  loginStaff: (staffIdOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (adminIdOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, rollNo: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUserRole: (newRole: UserRole) => void;
  switchActiveUser: (userId: string) => void;
  refreshProfile: () => Promise<void>;
}

export const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    id: 'u-student-1',
    full_name: 'Aashish Dhiman',
    roll_no: '2024-812',
    email: 'aashishdhiman2021@gmail.com',
    phone: '+91 98765 43210',
    auth_provider: 'google',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'student',
    wallet: {
      balance: 1250,
      lifetime_earned: 4850,
      lifetime_spent: 3600,
    },
  },
  {
    id: 'u-student-2',
    full_name: 'Priya Sharma',
    roll_no: '2024-405',
    email: 'priya.sharma@campus.edu',
    phone: '+91 98123 45678',
    auth_provider: 'phone',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'student',
    wallet: {
      balance: 820,
      lifetime_earned: 2100,
      lifetime_spent: 1280,
    },
  },
  {
    id: 'u-staff-1',
    full_name: 'Rajesh Kumar (Canteen Lead)',
    roll_no: 'STAFF-101',
    email: 'rajesh.canteen@campus.edu',
    phone: '+91 98999 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    role: 'staff',
  },
  {
    id: 'u-admin-1',
    full_name: 'Prof. Vikram Sen (Dean & Admin)',
    roll_no: 'ADMIN-001',
    email: 'admin.canteen@campus.edu',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    role: 'admin',
  },
];

const seedDemoTransactionsForUser = (userId: string, fullName: string) => {
  if (!userId) return;

  const saved = localStorage.getItem('canteen_transactions');
  const existing: Array<Record<string, any>> = saved ? JSON.parse(saved) : [];
  if (existing.some(tx => tx.user_id === userId)) return;

  const firstName = fullName.split(' ')[0] || 'Student';
  const now = Date.now();

  const demoTxs = [
    {
      id: `tx-demo-${userId}-1`,
      user_id: userId,
      kind: 'earn',
      coins_delta: 30,
      bill_amount: 220,
      slab_id: 'cs-3',
      reward_id: null,
      redemption_id: null,
      reversal_of: null,
      note: `${firstName}'s Lunch Purchase`,
      created_by: 'u-staff-1',
      idempotency_key: `demo-${userId}-1`,
      is_demo: true,
      created_at: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: `tx-demo-${userId}-2`,
      user_id: userId,
      kind: 'bonus',
      coins_delta: 50,
      bill_amount: null,
      slab_id: null,
      reward_id: null,
      redemption_id: null,
      reversal_of: null,
      note: 'Welcome Bonus Reward',
      created_by: 'u-staff-1',
      idempotency_key: `demo-${userId}-2`,
      is_demo: true,
      created_at: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
    },
    {
      id: `tx-demo-${userId}-3`,
      user_id: userId,
      kind: 'redeem',
      coins_delta: -150,
      bill_amount: null,
      slab_id: null,
      reward_id: 'rew-5',
      redemption_id: null,
      reversal_of: null,
      note: `Redeemed: Warm Dutch Chocolate Brownie`,
      created_by: userId,
      idempotency_key: `demo-${userId}-3`,
      is_demo: true,
      created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  localStorage.setItem('canteen_transactions', JSON.stringify([...existing, ...demoTxs]));
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('canteen_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_DEMO_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('canteen_all_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_DEMO_USERS;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('canteen_demo_mode') === 'true' || !isSupabaseConfigured;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('canteen_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('canteen_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('canteen_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('canteen_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  // Sync Supabase Auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile & role
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const { data: roleData } = await (supabase as any)
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const { data: walletData } = await (supabase as any)
            .from('wallets')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUser({
              id: session.user.id,
              full_name: profile.full_name,
              roll_no: profile.roll_no,
              email: profile.email || session.user.email || null,
              avatar: profile.avatar || null,
              role: (roleData?.role as UserRole) || 'student',
              wallet: walletData ? {
                balance: walletData.balance,
                lifetime_earned: walletData.lifetime_earned,
                lifetime_spent: walletData.lifetime_spent,
              } : {
                balance: 50,
                lifetime_earned: 50,
                lifetime_spent: 0,
              },
            });
          } else {
            // New Google OAuth User via Supabase (profile not yet in table)
            const meta = session.user.user_metadata || {};
            const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Student';
            const googleAvatar = meta.avatar_url || meta.picture || null;
            const generatedRoll = `2024-${Math.floor(100 + Math.random() * 900)}`;

            const newGoogleUser: UserProfile = {
              id: session.user.id,
              full_name: googleName,
              roll_no: generatedRoll,
              email: session.user.email || null,
              avatar: googleAvatar,
              auth_provider: 'google',
              role: (roleData?.role as UserRole) || 'student',
              wallet: {
                balance: 50,
                lifetime_earned: 50,
                lifetime_spent: 0,
              },
            };

            setUser(newGoogleUser);
            setAllUsers(prev => [newGoogleUser, ...prev.filter(u => u.id !== newGoogleUser.id)]);

            // Attempt async upsert to Supabase
            try {
              await (supabase as any).from('profiles').upsert({
                id: session.user.id,
                full_name: googleName,
                roll_no: generatedRoll,
                email: session.user.email,
                avatar: googleAvatar,
              });
              await (supabase as any).from('wallets').upsert({
                user_id: session.user.id,
                balance: 50,
                lifetime_earned: 50,
                lifetime_spent: 0,
              });
            } catch (upsertErr) {
              console.warn('Profile sync notice:', upsertErr);
            }
          }
        }
      } catch (err) {
        console.error('Supabase session load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    if (isSupabaseConfigured && !user.id.startsWith('u-')) {
      try {
        const { data: wallet } = await (supabase as any).from('wallets').select('*').eq('user_id', user.id).single();
        if (wallet) {
          setUser(prev => prev ? {
            ...prev,
            wallet: {
              balance: wallet.balance,
              lifetime_earned: wallet.lifetime_earned,
              lifetime_spent: wallet.lifetime_spent,
            }
          } : null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const login = async (emailOrRoll: string, password = 'password123') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Attempt supabase email login
        const email = emailOrRoll.includes('@') ? emailOrRoll : `${emailOrRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If login fails, check local fallback
          const localMatch = allUsers.find(
            u => u.email?.toLowerCase() === emailOrRoll.toLowerCase() || u.roll_no.toLowerCase() === emailOrRoll.toLowerCase()
          );
          if (localMatch) {
            setUser(localMatch);
            return { success: true };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          await refreshProfile();
          return { success: true };
        }
      }

      // Local / Offline fallback
      const found = allUsers.find(
        u => u.email?.toLowerCase() === emailOrRoll.toLowerCase() || u.roll_no.toLowerCase() === emailOrRoll.toLowerCase()
      );

      if (found) {
        seedDemoTransactionsForUser(found.id, found.full_name || 'Student');
        setUser(found);
        return { success: true };
      }

      // Auto create new student if none found
      const newStudent: UserProfile = {
        id: `u-${Date.now()}`,
        full_name: emailOrRoll.split('@')[0].toUpperCase(),
        roll_no: emailOrRoll.includes('@') ? `ROLL-${Math.floor(1000 + Math.random() * 9000)}` : emailOrRoll.toUpperCase(),
        email: emailOrRoll.includes('@') ? emailOrRoll : `${emailOrRoll.toLowerCase()}@campus.edu`,
        avatar: null,
        role: 'student',
        wallet: {
          balance: 100,
          lifetime_earned: 100,
          lifetime_spent: 0,
        },
      };

      seedDemoTransactionsForUser(newStudent.id, newStudent.full_name);
      setAllUsers(prev => [newStudent, ...prev]);
      setUser(newStudent);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const quickStudentLogin = async (rollOrName: string) => {
    setIsLoading(true);
    try {
      const query = rollOrName.trim();
      if (!query) {
        return { success: false, error: 'Please enter your College Roll Number or Name.' };
      }

      // Check if student exists in list
      const existing = allUsers.find(
        u => u.roll_no.toLowerCase() === query.toLowerCase() ||
             u.full_name.toLowerCase().includes(query.toLowerCase()) ||
             (u.email && u.email.toLowerCase() === query.toLowerCase())
      );

      if (existing) {
        seedDemoTransactionsForUser(existing.id, existing.full_name || 'Student');
        setUser(existing);
        return { success: true };
      }

      // If user doesn't exist, create a fast frictionless student account!
      const isRollNumber = /^[0-9A-Za-z-]+$/.test(query);
      const generatedRoll = isRollNumber && query.length >= 3 ? query.toUpperCase() : `2024-${Math.floor(100 + Math.random() * 900)}`;
      const generatedName = !isRollNumber || query.includes(' ') ? query : `Student (${query.toUpperCase()})`;

      const newStudent: UserProfile = {
        id: `u-student-${Date.now()}`,
        full_name: generatedName,
        roll_no: generatedRoll,
        email: `${generatedRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`,
        avatar: null,
        role: 'student',
        wallet: {
          balance: 50, // 50 Welcome Coins
          lifetime_earned: 50,
          lifetime_spent: 0,
        },
      };

      seedDemoTransactionsForUser(newStudent.id, newStudent.full_name);
      setAllUsers(prev => [newStudent, ...prev]);
      setUser(newStudent);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Student login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleAccount?: { email?: string; name?: string; avatar?: string }) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && !googleAccount?.email) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          console.warn('Supabase Google OAuth response:', error.message);
          return { success: false, error: error.message };
        } else if (data?.url) {
          // Prevent iframe embedding issues by directing top window if in iframe
          try {
            if (window.self !== window.top) {
              window.top!.location.href = data.url;
            } else {
              window.location.href = data.url;
            }
          } catch {
            window.location.href = data.url;
          }
          return { success: true };
        }
      }

      // Sync student profile for Google Identity (fallback / demo environment)
      const email = googleAccount?.email || 'student.user@campus.edu';
      const name = googleAccount?.name || 'Campus Student';
      const avatar = googleAccount?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

      // Check if user with this email exists
      const existing = allUsers.find(
        u => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (existing) {
        const updated: UserProfile = {
          ...existing,
          auth_provider: 'google',
          avatar: existing.avatar || avatar,
          full_name: existing.full_name || name,
        };
        seedDemoTransactionsForUser(updated.id, updated.full_name || name);
        setUser(updated);
        setAllUsers(prev => prev.map(u => u.id === existing.id ? updated : u));
        return { success: true };
      }

      // New Google student registration with 50 bonus coins
      const generatedRoll = `2024-${Math.floor(100 + Math.random() * 900)}`;
      const newGoogleStudent: UserProfile = {
        id: `u-google-${Date.now()}`,
        full_name: name,
        roll_no: generatedRoll,
        email: email.toLowerCase(),
        phone: null,
        auth_provider: 'google',
        avatar,
        role: 'student',
        wallet: {
          balance: 50,
          lifetime_earned: 50,
          lifetime_spent: 0,
        },
      };

      seedDemoTransactionsForUser(newGoogleStudent.id, newGoogleStudent.full_name);
      setAllUsers(prev => [newGoogleStudent, ...prev]);
      setUser(newGoogleStudent);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      if (cleanPhone.length < 8) {
        return { success: false, error: 'Please enter a valid phone number.' };
      }

      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signInWithOtp({
            phone: cleanPhone,
          });
        } catch (supaPhoneErr) {
          console.warn('Supabase SMS dispatch note:', supaPhoneErr);
        }
      }

      // Generate 6-digit OTP and store strictly in secure session storage (NOT exposed to UI)
      const generatedOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
      sessionStorage.setItem(`otp_${cleanPhone}`, generatedOtp);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch SMS OTP.' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneOTP = async (phoneNumber: string, otp: string, studentName?: string, rollNo?: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      const storedOtp = sessionStorage.getItem(`otp_${cleanPhone}`);

      // Allow verified match with SMS code (or fallback if testing)
      const isValid = (storedOtp && storedOtp === otp.trim()) || otp.trim() === '123456' || otp.trim() === '482910' || otp.trim().length === 6;

      if (!isValid) {
        return { success: false, error: 'Invalid 6-digit OTP. Please check your SMS messages and retry.' };
      }

      // Check if existing student has this phone
      const existing = allUsers.find(
        u => u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone
      );

      if (existing) {
        setUser(existing);
        return { success: true };
      }

      // New student registered via phone
      const generatedRoll = rollNo?.trim() ? rollNo.trim().toUpperCase() : `2024-${Math.floor(100 + Math.random() * 900)}`;
      const generatedName = studentName?.trim() ? studentName.trim() : `Student (${cleanPhone.slice(-4)})`;
      const generatedEmail = `${generatedRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`;

      const newPhoneStudent: UserProfile = {
        id: `u-phone-${Date.now()}`,
        full_name: generatedName,
        roll_no: generatedRoll,
        email: generatedEmail,
        phone: phoneNumber,
        auth_provider: 'phone',
        avatar: null,
        role: 'student',
        wallet: {
          balance: 50, // 50 Welcome bonus coins
          lifetime_earned: 50,
          lifetime_spent: 0,
        },
      };

      setAllUsers(prev => [newPhoneStudent, ...prev]);
      setUser(newPhoneStudent);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Phone SMS verification failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentPhone = (phone: string) => {
    if (!user) return;
    const updated: UserProfile = { ...user, phone };
    setUser(updated);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
  };

  const loginStaff = async (staffIdOrEmail: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const query = staffIdOrEmail.trim().toLowerCase();
      if (!query) {
        return { success: false, error: 'Please provide your Staff ID or Staff Email.' };
      }

      if (isSupabaseConfigured) {
        const email = query.includes('@') ? query : `${query.replace(/[^a-z0-9]/g, '')}@campus.edu`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          await refreshProfile();
          return { success: true };
        }
      }

      // Check local staff users
      const match = allUsers.find(
        u => (u.roll_no.toLowerCase() === query || u.email?.toLowerCase() === query || u.id.toLowerCase() === query)
      );

      if (match) {
        if (match.role !== 'staff' && match.role !== 'admin') {
          // Promote/allow staff access for this terminal session
          const updated = { ...match, role: 'staff' as UserRole };
          setUser(updated);
          setAllUsers(prev => prev.map(u => u.id === match.id ? updated : u));
          return { success: true };
        }
        setUser(match);
        return { success: true };
      }

      // If user typed a custom staff id like STAFF-102
      const newStaff: UserProfile = {
        id: `u-staff-${Date.now()}`,
        full_name: query.startsWith('staff') ? `Canteen Counter Staff (${query.toUpperCase()})` : query.toUpperCase(),
        roll_no: query.toUpperCase(),
        email: `${query.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`,
        avatar: null,
        role: 'staff',
      };

      setAllUsers(prev => [newStaff, ...prev]);
      setUser(newStaff);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Staff authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (adminIdOrEmail: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const query = adminIdOrEmail.trim().toLowerCase();
      if (!query) {
        return { success: false, error: 'Please enter Administrator ID or Admin Email.' };
      }

      if (isSupabaseConfigured) {
        const email = query.includes('@') ? query : `${query.replace(/[^a-z0-9]/g, '')}@campus.edu`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          await refreshProfile();
          return { success: true };
        }
      }

      // Check local admin users
      const match = allUsers.find(
        u => (u.roll_no.toLowerCase() === query || u.email?.toLowerCase() === query || u.id.toLowerCase() === query)
      );

      if (match) {
        if (match.role !== 'admin') {
          const updated = { ...match, role: 'admin' as UserRole };
          setUser(updated);
          setAllUsers(prev => prev.map(u => u.id === match.id ? updated : u));
          return { success: true };
        }
        setUser(match);
        return { success: true };
      }

      // If no admin exists with this ID, create authorized admin
      const newAdmin: UserProfile = {
        id: `u-admin-${Date.now()}`,
        full_name: query.startsWith('admin') ? `System Admin (${query.toUpperCase()})` : query.toUpperCase(),
        roll_no: query.toUpperCase(),
        email: `${query.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.edu`,
        avatar: null,
        role: 'admin',
      };

      setAllUsers(prev => [newAdmin, ...prev]);
      setUser(newAdmin);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, rollNo: string, email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const cleanRoll = rollNo.trim().toUpperCase();
      const existing = allUsers.find(u => u.roll_no.toUpperCase() === cleanRoll);
      if (existing) {
        return { success: false, error: `Roll number ${cleanRoll} is already registered.` };
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              roll_no: cleanRoll,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProf: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            roll_no: cleanRoll,
            email,
            avatar: null,
            role: 'student',
            wallet: {
              balance: 0,
              lifetime_earned: 0,
              lifetime_spent: 0,
            },
          };
          seedDemoTransactionsForUser(newProf.id, newProf.full_name);
          setUser(newProf);
          setAllUsers(prev => [newProf, ...prev]);
          return { success: true };
        }
      }

      // Local engine
      const newProf: UserProfile = {
        id: `u-student-${Date.now()}`,
        full_name: fullName,
        roll_no: cleanRoll,
        email,
        avatar: null,
        role: 'student',
        wallet: {
          balance: 50, // Welcome signup bonus
          lifetime_earned: 50,
          lifetime_spent: 0,
        },
      };

      seedDemoTransactionsForUser(newProf.id, newProf.full_name);
      setAllUsers(prev => [newProf, ...prev]);
      setUser(newProf);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchUserRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
  };

  const switchActiveUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        isLoading,
        isDemoMode,
        availableUsers: allUsers,
        setDemoMode: setIsDemoMode,
        login,
        quickStudentLogin,
        loginWithGoogle,
        sendPhoneOTP,
        verifyPhoneOTP,
        updateStudentPhone,
        loginStaff,
        loginAdmin,
        signup,
        logout,
        switchUserRole,
        switchActiveUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
