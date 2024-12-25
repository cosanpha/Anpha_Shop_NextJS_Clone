import { ITag } from '@/models/TagModel'
import React, { memo, useState } from 'react'
import { FaCheck, FaSave, FaTrash } from 'react-icons/fa'
import { MdCancel, MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'

interface TagItemProps {
  data: ITag
  loadingTags: string[]
  className?: string

  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>

  editingTags: string[]
  setEditingTags: React.Dispatch<React.SetStateAction<string[]>>

  editingValues: { _id: string; title: string }[]
  setEditingValues: React.Dispatch<React.SetStateAction<{ _id: string; title: string }[]>>

  handleSaveEditingTags: (editingValues: { _id: string; value: string }[]) => void
  handleDeleteTags: (ids: string[]) => void
  handleFeatureTags: (ids: string[], isFeatured: boolean) => void
}

function TagItem({
  data,
  loadingTags,
  className = '',
  // selected
  selectedTags,
  setSelectedTags,
  // editing
  editingTags,
  setEditingTags,
  // values
  editingValues,
  setEditingValues,
  // functions
  handleSaveEditingTags,
  handleDeleteTags,
  handleFeatureTags,
}: TagItemProps) {
  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  return (
    <>
      <div
        className={`trans-200 flex cursor-pointer flex-col rounded-lg p-4 text-dark shadow-lg ${
          selectedTags.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        key={data._id}
        onClick={() =>
          setSelectedTags(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        {/* MARK: Body */}
        {editingTags.includes(data._id) ? (
          // Tag Title Input
          <input
            className="mb-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-dark outline-none"
            type="text"
            value={editingValues.find(t => t._id === data._id)?.title}
            onClick={e => e.stopPropagation()}
            disabled={loadingTags.includes(data._id)}
            onChange={e =>
              setEditingValues(prev =>
                prev.map(t => (t._id === data._id ? { _id: data._id, title: e.target.value } : t))
              )
            }
          />
        ) : (
          // Tag Title
          <p
            className="font-semibold"
            title={data.slug}
          >
            {data.title}
          </p>
        )}

        {/* Product Quantity */}
        <p
          className="mb-2 font-semibold"
          title={`Product Quantity: ${data.productQuantity}`}
        >
          <span>Pr.Q:</span> <span className="text-primary">{data.productQuantity}</span>
        </p>

        {/* MARK: Action Buttons */}
        <div className="flex gap-4 self-end rounded-lg border border-dark px-3 py-2">
          {/* Feature Button */}
          {!editingTags.includes(data._id) && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                handleFeatureTags([data._id], !data.isFeatured)
              }}
              disabled={loadingTags.includes(data._id)}
              title={data.isFeatured ? 'Mark Featured' : 'Mark Unfeatured'}
            >
              <FaCheck
                size={18}
                className={`wiggle ${data.isFeatured ? 'text-green-500' : 'text-slate-300'}`}
              />
            </button>
          )}

          {/* Edit Button */}
          {!editingTags.includes(data._id) && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                setEditingTags(prev => (!prev.includes(data._id) ? [...prev, data._id] : prev))
                setEditingValues(prev =>
                  !prev.some(cate => cate._id === data._id)
                    ? [...prev, { _id: data._id, title: data.title }]
                    : prev
                )
              }}
              title="Edit"
            >
              <MdEdit
                size={18}
                className="wiggle"
              />
            </button>
          )}

          {/* Save Button */}
          {editingTags.includes(data._id) && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                handleSaveEditingTags([editingValues.find(cate => cate._id === data._id)] as any[])
              }}
              disabled={loadingTags.includes(data._id)}
              title="Save"
            >
              {loadingTags.includes(data._id) ? (
                <RiDonutChartFill
                  size={18}
                  className="animate-spin text-slate-300"
                />
              ) : (
                <FaSave
                  size={18}
                  className="wiggle text-green-500"
                />
              )}
            </button>
          )}

          {/* Cancel Button */}
          {editingTags.includes(data._id) && !loadingTags.includes(data._id) && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                setEditingTags(prev =>
                  prev.includes(data._id) ? prev.filter(id => id !== data._id) : prev
                )
                setEditingValues(prev => prev.filter(cate => cate._id !== data._id))
              }}
              title="Cancel"
            >
              <MdCancel
                size={20}
                className="wiggle text-slate-300"
              />
            </button>
          )}

          {/* Delete Button */}
          {!editingTags.includes(data._id) && (
            <button
              className="group block"
              onClick={e => {
                e.stopPropagation()
                setIsOpenConfirmModal(true)
              }}
              disabled={loadingTags.includes(data._id)}
              title="Delete"
            >
              {loadingTags.includes(data._id) ? (
                <RiDonutChartFill
                  size={18}
                  className="animate-spin text-slate-300"
                />
              ) : (
                <FaTrash
                  size={18}
                  className="wiggle"
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title="Delete Tag"
        content="Are you sure that you want to delete this tag?"
        onAccept={() => handleDeleteTags([data._id])}
        isLoading={loadingTags.includes(data._id)}
      />
    </>
  )
}

export default memo(TagItem)
