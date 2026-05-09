import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=800&h=600&fit=crop";

export function useTours(filters = {}) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTours = async () => {
      try {
        let query = supabase.from('tours').select('*');

        if (filters.purpose && filters.purpose !== 'all') {
          query = query.eq('purpose', filters.purpose);
        }
        if (filters.theme && filters.theme !== 'all') {
          query = query.eq('theme', filters.theme);
        }
        if (filters.duration) {
          if (filters.duration === 'short') {
            query = query.lte('duration', 7);
          } else if (filters.duration === 'medium') {
            query = query.gte('duration', 8).lte('duration', 11);
          } else if (filters.duration === 'long') {
            query = query.gte('duration', 12);
          }
        }

        const { data, error: supabaseError } = await query.order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setTours(data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setTours([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTours();
    return () => { isMounted = false; };
  }, [JSON.stringify(filters)]);

  return { tours, loading, error };
}

export function useTopRatedTours(limit = 4) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTopRatedTours = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('*')
          .order('rating', { ascending: false, nullsLast: true })
          .limit(limit);

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setTours(data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setTours([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopRatedTours();
    return () => { isMounted = false; };
  }, [limit]);

  return { tours, loading, error };
}

export function useTourBySlug(slug) {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTour = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('*')
          .eq('slug', slug)
          .single();

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setTour(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setTour(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) fetchTour();
    return () => { isMounted = false; };
  }, [slug]);

  return { tour, loading, error };
}

export function useTourById(id) {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTour = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setTour(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setTour(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchTour();
    return () => { isMounted = false; };
  }, [id]);

  return { tour, loading, error };
}

export function usePackageById(id) {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchPackage = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          console.warn('Supabase fetch error (table may not exist):', supabaseError.message);
          if (isMounted) {
            setPkg(null);
            setError(null);
          }
        } else if (isMounted) {
          setPkg(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setPkg(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchPackage();
    return () => { isMounted = false; };
  }, [id]);

  return { pkg, loading, error };
}

export function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchDestinations = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('location, city')
          .order('location', { ascending: true });

        if (supabaseError) throw supabaseError;

        const uniqueLocations = [...new Set(data?.map(t => t.location).filter(Boolean))];
        const uniqueCities = [...new Set(data?.map(t => t.city).filter(Boolean))];

        if (isMounted) {
          setDestinations({ locations: uniqueLocations, cities: uniqueCities });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setDestinations({ locations: [], cities: [] });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDestinations();
    return () => { isMounted = false; };
  }, []);

  return { destinations, loading, error };
}

export function useSearchTours(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const searchTours = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('tours')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,cities.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setResults(data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setResults([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounce = setTimeout(searchTours, 300);
    return () => {
      clearTimeout(debounce);
      isMounted = false;
    };
  }, [query]);

  return { results, loading, error };
}

export function useGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchGuides = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'guide')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setGuides(data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setGuides([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGuides();
    return () => { isMounted = false; };
  }, []);

  return { guides, loading, error };
}

export { FALLBACK_IMAGE };