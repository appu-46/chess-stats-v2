import { useQuery } from '@tanstack/react-query'
import { apiFlags } from '../services/apiFlags'

function useCountry(url: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['country', url],
    queryFn: () => apiFlags(url),
    enabled: !!url,
  })

  return { data, isPending, error }
}

export default useCountry
