import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProduct, createProduct, updateProduct, patchProduct, deleteProduct, getBrands } from '../services/productService'

// Query keys for cache management
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  brands: () => [...productKeys.all, 'brands'],
}

// Hook to fetch products with filters
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    keepPreviousData: true, // Keep previous data while fetching new page
  })
}

// Hook to fetch single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id, // Only fetch if ID exists
  })
}

// Hook to fetch brands
export const useBrands = () => {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: () => getBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
  })
}

// Hook to create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (response) => {
      // Debug: Log API response
      console.log('Create product API response:', response)
      console.log('Created product images:', response?.data?.images)
      
      // Update cache with the returned product (includes images)
      if (response?.data) {
        queryClient.setQueryData(productKeys.detail(response.data._id), { success: true, data: response.data })
      }
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.brands() })
    },
  })
}

// Hook to update product (full update)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (data, variables) => {
      // Debug: Log API response
      console.log('Update product API response:', data)
      console.log('Updated product images:', data?.data?.images)
      
      // Update cache with the returned product (includes images)
      if (data?.data) {
        queryClient.setQueryData(productKeys.detail(variables.id), { success: true, data: data.data })
      }
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.brands() })
    },
  })
}

// Hook to patch product (partial update - optimized)
export const usePatchProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => patchProduct(id, data),
    // Optimistic update - update UI immediately
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Snapshot previous values
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))
      const previousProducts = queryClient.getQueriesData({ queryKey: productKeys.lists() })

      // Optimistically update product detail
      if (previousProduct) {
        const mergedData = { ...previousProduct.data, ...data }
        // Ensure images array is properly merged
        if (data.images !== undefined) {
          mergedData.images = data.images
        }
        queryClient.setQueryData(productKeys.detail(id), {
          ...previousProduct,
          data: mergedData,
        })
      }

      // Optimistically update products list
      previousProducts.forEach(([queryKey, productsData]) => {
        if (productsData?.data) {
          const updatedData = productsData.data.map((product) => {
            if (product._id === id) {
              // Merge updates, ensuring images array is preserved if present
              const merged = { ...product, ...data }
              // If images is in the update, use it; otherwise keep existing
              if (data.images !== undefined) {
                merged.images = data.images
              }
              return merged
            }
            return product
          })
          queryClient.setQueryData(queryKey, { ...productsData, data: updatedData })
        }
      })

      return { previousProduct, previousProducts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(variables.id), context.previousProduct)
      }
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: (data, variables) => {
      // Debug: Log API response
      console.log('PATCH product API response:', data)
      console.log('PATCH product images:', data?.data?.images)
      
      // Update cache with the returned product (includes images)
      if (data?.data) {
        queryClient.setQueryData(productKeys.detail(variables.id), { success: true, data: data.data })
        
        // Also update in lists cache
        queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
          if (old?.data) {
            return {
              ...old,
              data: old.data.map((p) => 
                p._id === variables.id ? { ...p, ...data.data } : p
              )
            }
          }
          return old
        })
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.brands() })
    },
  })
}

// Hook to delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })

      // Snapshot previous values
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))
      const previousProducts = queryClient.getQueriesData({ queryKey: productKeys.lists() })

      // Optimistically remove product from lists
      previousProducts.forEach(([queryKey, productsData]) => {
        if (productsData?.data) {
          const updatedData = productsData.data.filter((product) => product._id !== id)
          queryClient.setQueryData(queryKey, { ...productsData, data: updatedData })
        }
      })

      // Remove product detail
      queryClient.removeQueries({ queryKey: productKeys.detail(id) })

      return { previousProduct, previousProducts }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, productsData]) => {
          queryClient.setQueryData(queryKey, productsData)
        })
      }
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(id), context.previousProduct)
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}


