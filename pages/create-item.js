import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getServerSession } from 'next-auth/next'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { NFT_CATEGORIES } from '../lib/categories'
import { mintNft } from '../lib/marketplace'
import { authOptions } from '../lib/authOptions'
import { uploadImage } from '../lib/uploadClient'

export default function CreateItem({ session }) {
  const [formInput, setFormInput] = useState({
    price: '',
    name: '',
    description: '',
    image: '',
    category: 'Art',
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTags, setAiTags] = useState([])

  const fileRef = useRef(null)
  const router = useRouter()

  async function onPickFile(e) {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      setUploading(true)

      const url = await uploadImage(file)

      // IMPORTANT:
      // Keep local uploads as:
      // /uploads/file.png
      // DO NOT convert to localhost URL
      setFormInput((f) => ({
        ...f,
        image: url,
      }))

      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)

      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  async function createMarket() {
    const { name, description, price, image, category } = formInput

    const priceTrim = String(price).trim()

    if (!name || !description || !priceTrim || !image) {
      toast.error('Please fill all required fields')
      return
    }

    if (Number.isNaN(Number(priceTrim)) || Number(priceTrim) <= 0) {
      toast.error('Enter a valid price')
      return
    }

    try {
      setLoading(true)

      toast.loading('Creating NFT…', {
        id: 'createNFT',
      })

      const tags = [
        ...new Set([
          ...(aiTags || []),
          category,
          'metanft',
        ]),
      ].filter(Boolean)

      const minted = await mintNft({
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        price: priceTrim,
        category,
        creatorName:
          session?.user?.name ||
          session?.user?.email ||
          'Creator',
        tags,
      })

      if (minted?.syncWarning) {
        toast.success('NFT minted on blockchain', { id: 'createNFT' })
        toast(
          minted.syncWarning,
          {
            icon: '⚠️',
            duration: 5000,
          }
        )
      } else {
        toast.success('NFT created successfully!', {
          id: 'createNFT',
        })
      }

      router.push('/')
    } catch (error) {
      console.error('CREATE NFT ERROR:', error)
      const message = String(error?.message || '')
      const hint = message.toLowerCase().includes('mongo')
        ? 'Blockchain may have succeeded, but metadata sync failed.'
        : 'Minting on blockchain failed.'
      toast.error(`Failed to create NFT. ${hint}`, {
        id: 'createNFT',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Create NFT — MetaNFT">
      <div className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft size={18} />
              Back to marketplace
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 sm:p-10 shadow-xl backdrop-blur-xl">
            <div className="mb-10 text-center">
              <div className="mb-5 flex justify-center">
                <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 shadow-lg">
                  <Sparkles
                    className="text-white"
                    size={40}
                  />
                </div>
              </div>

              <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                Create NFT
              </h1>

              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Mint and list your digital asset — demo
                mode works without a wallet.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* NFT NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  NFT name
                </label>

                <input
                  placeholder="Enter NFT name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-slate-900 dark:text-white"
                  value={formInput.name}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>

                <textarea
                  rows={5}
                  placeholder="Describe your NFT…"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-slate-900 dark:text-white"
                  value={formInput.description}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>

                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-slate-900 dark:text-white"
                  value={formInput.category}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      category: e.target.value,
                    })
                  }
                >
                  {NFT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  NFT image
                </label>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={uploading || loading}
                  onChange={onPickFile}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-700 dark:text-slate-300"
                />

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {uploading
                    ? 'Uploading…'
                    : 'JPEG, PNG, WebP, GIF, SVG — max 5MB'}
                </p>
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Image URL
                </label>

                <input
                  readOnly
                  value={formInput.image}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700 outline-none dark:border-white/15 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              {/* PREVIEW */}
              {formInput.image && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formInput.image}
                    alt="Preview"
                    className="h-80 w-full object-cover"
                  />
                </div>
              )}

              {/* AI BUTTONS */}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    aiLoading || !formInput.image
                  }
                  onClick={async () => {
                    try {
                      // #region agent log
                      fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run-ai-1',hypothesisId:'A1',location:'pages/create-item.js:aiDescribe:click',message:'Generate with AI clicked',data:{hasImage:Boolean(formInput.image),category:formInput.category,imagePrefix:String(formInput.image||'').slice(0,40)},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      setAiLoading(true)

                      const r = await fetch(
                        '/api/ai/describe',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type':
                              'application/json',
                          },
                          body: JSON.stringify({
                            imageUrl: formInput.image,
                            category:
                              formInput.category,
                          }),
                        }
                      )

                      // #region agent log
                      fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run-ai-1',hypothesisId:'A2',location:'pages/create-item.js:aiDescribe:response',message:'AI describe response received',data:{status:r.status,ok:r.ok},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      const j = await r.json()
                      // #region agent log
                      fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run-ai-1',hypothesisId:'A3',location:'pages/create-item.js:aiDescribe:payload',message:'AI describe payload parsed',data:{hasTitle:Boolean(j?.title),hasDescription:Boolean(j?.description),tagsCount:Array.isArray(j?.tags)?j.tags.length:null,error:j?.error||null},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion

                      if (j.title) {
                        setFormInput((f) => ({
                          ...f,
                          name: j.title || f.name,
                          description:
                            j.description ||
                            f.description,
                        }))
                      }

                      if (Array.isArray(j.tags)) {
                        setAiTags(j.tags)
                      }
                      // #region agent log
                      fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run-ai-1',hypothesisId:'A4',location:'pages/create-item.js:aiDescribe:applied',message:'AI fields apply branch complete',data:{appliedTitle:Boolean(j?.title),appliedTags:Array.isArray(j?.tags)},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion

                      toast.success(
                        'AI fields applied'
                      )
                    } catch {
                      // #region agent log
                      fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run-ai-1',hypothesisId:'A5',location:'pages/create-item.js:aiDescribe:catch',message:'AI describe click handler threw',data:{note:'catch_without_error_object'},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      toast.error(
                        'AI generation failed'
                      )
                    } finally {
                      setAiLoading(false)
                    }
                  }}
                >
                  {aiLoading
                    ? 'Working…'
                    : 'Generate with AI'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={aiLoading}
                  onClick={async () => {
                    try {
                      setAiLoading(true)

                      const r = await fetch(
                        '/api/ai/price',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type':
                              'application/json',
                          },
                          body: JSON.stringify({
                            category:
                              formInput.category,
                            description:
                              formInput.description,
                            tags: aiTags,
                          }),
                        }
                      )

                      const j = await r.json()

                      if (j.price) {
                        setFormInput((f) => ({
                          ...f,
                          price: String(j.price),
                        }))

                        toast.success(
                          j.rationale ||
                            'Price suggested'
                        )
                      }
                    } catch {
                      toast.error(
                        'Price suggestion failed'
                      )
                    } finally {
                      setAiLoading(false)
                    }
                  }}
                >
                  Suggest price
                </Button>
              </div>

              {/* PRICE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Price (ETH)
                </label>

                <input
                  placeholder="0.1"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/15 dark:bg-slate-900 dark:text-white"
                  value={formInput.price}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              {/* CREATE BUTTON */}
              <Button
                type="button"
                onClick={createMarket}
                disabled={loading}
                className="mt-2 w-full py-4 text-lg"
              >
                {loading
                  ? 'Creating NFT…'
                  : 'Mint & list NFT'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(
    ctx.req,
    ctx.res,
    authOptions
  )

  if (!session) {
    return {
      redirect: {
        destination:
          '/auth/signin?callbackUrl=/create-item',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}