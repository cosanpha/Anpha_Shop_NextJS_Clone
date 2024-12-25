import { getRankUsersApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCircleNotch, FaSearch } from 'react-icons/fa'

interface UserSpendingRankTabProps {
  className?: string
}

function UserSpendingRankTab({ className = '' }: UserSpendingRankTabProps) {
  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [chunk, setChunk] = useState<number>(20)

  const [users, setUsers] = useState<any[]>([])
  const [showUsers, setShowUsers] = useState<any[]>([])

  const [search, setSearch] = useState<string>('')
  const [searchResultChunk, setSearchResultChunk] = useState<number>(20)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState<any[]>([])
  const searchRef = useRef<any>(null)

  // values
  const colors = ['orange-500', 'sky-500', 'green-500', 'yellow-500', 'pink-500']

  useEffect(() => {
    const getRankUsers = async () => {
      // start loading
      setLoading(true)

      try {
        const { spentUser } = await getRankUsersApi()

        setUsers(spentUser)
        setShowUsers(spentUser.slice(0, 20))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    }
    getRankUsers()
  }, [])

  // handle loading more
  const handleLoadMore = useCallback(() => {
    if (search.trim()) {
      setSearchResultChunk(searchResultChunk + 10)
      setShowSearchResults(searchResults.slice(0, searchResultChunk + 10))
    } else {
      setChunk(chunk + 10)
      setShowUsers(users.slice(0, chunk + 10))
    }
  }, [chunk, users, search, searchResults, searchResultChunk])

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearch(value)

      if (searchRef.current) {
        clearTimeout(searchRef.current)
      }

      searchRef.current = setTimeout(() => {
        if (value.trim()) {
          const searchResults = users.filter(user => {
            let string = ''
            Object.keys(user).forEach(key => {
              if (typeof user[key] === 'string' || 'number') {
                string += `${user[key]} `
              }
            })

            return string.toLowerCase().includes(value.toLowerCase())
          })

          setSearchResults(searchResults)
          setShowSearchResults(searchResults.slice(0, 20))
        } else {
          setShowSearchResults([])
        }
      }, 500)
    },
    [users]
  )

  return (
    <div className={`${className} flex flex-col overflow-hidden`}>
      {!loading && (
        <div className="w-full">
          <div className={`flex`}>
            {/* MARK: Icon */}
            <span
              className={`inline-flex cursor-pointer items-center rounded-bl-lg rounded-tl-lg border-[2px] border-slate-200 bg-slate-100 px-3 text-sm text-gray-900`}
            >
              <FaSearch
                size={19}
                className="text-secondary"
              />
            </span>

            {/* MARK: Text Field */}
            <div
              className={`relative w-full rounded-br-lg rounded-tr-lg border-[2px] border-l-0 border-slate-200 bg-white`}
            >
              <input
                id="search"
                className="peer block h-[46px] w-full bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-dark focus:outline-none focus:ring-0"
                disabled={loading}
                type="text"
                value={search}
                onChange={handleSearch}
              />

              {/* MARK: Label */}
              <label
                htmlFor="search"
                className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-pointer text-nowrap rounded-md bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4`}
              >
                Search
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="my-1 flex items-center justify-center">
        <span className="rounded-lg bg-dark-100 px-1.5 py-0.5 text-xs font-semibold text-white">
          {searchResults.length} user{searchResults.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-scroll">
        {(search.trim() ? showSearchResults : showUsers).map((user, index) => (
          <div
            className="mb-4 flex gap-3"
            key={index}
          >
            <Link
              href="/"
              className="relative aspect-square flex-shrink-0 text-white"
            >
              <Image
                className="rounded-lg"
                src={user.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR}
                width={45}
                height={45}
                alt="thumbnail"
              />
              {index < 10 && (
                <span
                  className={`absolute -right-1.5 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-dark-100 px-1.5 text-sm font-semibold italic text-${colors[index]}`}
                >
                  {index + 1 <= 10 ? index + 1 : ''}
                </span>
              )}
            </Link>
            <div className="font-body tracking-wider">
              <p className="font-semibold">
                {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.username}{' '}
                <span className="text-sm text-slate-400">({user.email})</span>
              </p>
              <p className="text-yellow-500">{formatPrice(user.spent)}</p>
            </div>
          </div>
        ))}

        {/* Load More */}
        {(search.trim()
          ? showSearchResults.length < searchResults.length
          : showUsers.length < users.length || loading) && (
          <div className="flex items-center justify-center">
            <button
              className={`trans-200 flex h-8 items-center justify-center rounded-md border-2 px-3 text-sm font-semibold text-white hover:bg-white hover:text-dark ${
                loading ? 'pointer-events-none border-slate-400 bg-white' : 'border-dark bg-dark-100'
              }`}
              onClick={handleLoadMore}
            >
              {loading ? (
                <FaCircleNotch
                  size={18}
                  className="animate-spin text-slate-400"
                />
              ) : (
                <span>({search.trim() ? showSearchResults.length : showUsers.length}) Load more...</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(UserSpendingRankTab)
