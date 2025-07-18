'use client';

import { Button, Select, SelectItem } from '@nextui-org/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { cn } from '@nextui-org/theme';
import { Input } from '@nextui-org/input';
import api from '@/lib/api';
import Link from 'next/link';

const difficulties = [
  {
    title: 'Easy',
    color: 'text-green-500'
  },
  {
    title: 'Medium',
    color: 'text-yellow-500'
  },
  {
    title: 'Hard',
    color: 'text-red-500'
  }
];

const questionTypes = [
  { name: 'True or False' },
  { name: 'Multiple choice' },
  { name: 'Single choice' },
  { name: 'Short answer' },
  { name: 'Long answer' }
];

export default function Home() {
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      test: [
        {
          type: 'True or False',
          difficulty: 'Medium',
          count: 1
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'test'
  });

  const [files, setFiles] = useState<File[]>([]);

  const onSubmit = async (data: any) => {
    console.log(data, files);

    const formData = new FormData();

    formData.append('groups', JSON.stringify(data.test));

    for (const file of files) {
      formData.append('files', file);
    }

    await api.post('/quiz-craft/', formData);
  };

  const handleFileChange = (event: any) => {
    setFiles((prev) => [...prev, event.target.files[0]]);
  };

  const [quizzes, setQuizzes] = useState<
    {
      files: string[];
      timestamp: Date;
      id: number;
    }[]
  >([]);

  useEffect(() => {
    async function fetchQuizzes() {
      const response = await api.get('/quiz-craft/');

      console.log(response.data);

      setQuizzes(
        response.data.map((quiz: any) => ({
          files: quiz.files.map(
            (file: any) => file.path.match(/[^-]*-[^-]*-(.*)/)[1]
          ),
          timestamp: new Date(quiz.timestamp),
          id: quiz.id
        }))
      );
    }

    void fetchQuizzes();
  }, []);

  return (
    <div className='w-screen h-screen bg-secondary-200 flex flex-col items-center px-4'>
      <ScrollShadow
        hideScrollBar
        size={400}
        className='flex flex-col items-stretch pb-12'
      >
        <div className='flex gap-4 self-center pb-11 pt-14'>
          <i className='fa-solid fa-check-square text-[5rem] text-secondary-600' />
          <h1 className='font-semibold text-[3rem] text-secondary-600'>
            QuizCraft
          </h1>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-white/40 rounded-3xl p-4 gap-2.5 flex flex-col'
        >
          <div className='flex flex-col bg-white/50 p-4 gap-4 rounded-3xl'>
            <label className='text-primary-700 font-semibold text-xs'>
              Choose the materials to generate questions from (documents,
              images, etc.)
            </label>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-2'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className='bg-white py-3 px-4 justify-between rounded-2xl flex items-center'
                  >
                    <div className='flex items-center gap-1'>
                      <i className='fa fa-file-lines text-xl text-primary-600' />
                      <label className='font-semibold text-base text-primary-600'>
                        {file.name}
                      </label>
                    </div>
                    <i
                      onClick={() => {
                        setFiles((prevItems) => {
                          const updatedItems = [...prevItems];
                          updatedItems.splice(index, 1);
                          return updatedItems;
                        });
                      }}
                      className='fa fa-xmark-circle text-primary-300 text-xl cursor-pointer'
                    />
                  </div>
                ))}
              </div>
              <div>
                <input
                  onChange={handleFileChange}
                  type='file'
                  id='fileInput'
                  className='hidden'
                />
                <Button
                  className='bg-white w-full text-primary-600 font-semibold text-base'
                  onClick={() => {
                    document.getElementById('fileInput')!.click();
                    console.log(document.getElementById('fileInput'));
                  }}
                  startContent={<i className='fa fa-plus' />}
                >
                  Add a file
                </Button>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2.5'>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='flex flex-col gap-4 p-4 bg-white/50 rounded-3xl'
              >
                <div className='flex items-center justify-between'>
                  <h1 className='font-semibold text-primary-700 text-base'>
                    Question group {index + 1}
                  </h1>
                  {fields.length > 1 && (
                    <i
                      onClick={() => {
                        if (fields.length > 1) {
                          remove(index);
                        }
                      }}
                      className='fa fa-xmark-circle text-xl cursor-pointer'
                    />
                  )}
                </div>
                <div className='flex gap-4 flex-col sm:flex-row'>
                  <Select
                    {...register(`test.${index}.type`, {
                      required: true
                    })}
                    items={questionTypes}
                    label='Question type'
                    className='min-w-40'
                    classNames={{
                      trigger: 'bg-white',
                      label: 'font-semibold text-xs !text-primary-500',
                      value: 'font-semibold text-base !text-primary-700'
                    }}
                  >
                    {(questionType) => (
                      <SelectItem
                        classNames={{
                          title: 'font-semibold text-base'
                        }}
                        className='font-semibold text-base text-white'
                        key={questionType.name}
                      >
                        {questionType.name}
                      </SelectItem>
                    )}
                  </Select>
                  <Select
                    {...register(`test.${index}.difficulty`, {
                      required: true
                    })}
                    items={difficulties}
                    label='Difficulty level'
                    className='min-w-40'
                    classNames={{
                      trigger: 'bg-white',
                      label: 'font-semibold text-xs !text-primary-500'
                    }}
                    renderValue={(difficulties) =>
                      difficulties.map((difficulty) => (
                        <label
                          key={difficulty.data!.color}
                          className={cn(
                            '!font-semibold text-base',
                            difficulty.data!.color
                          )}
                        >
                          {difficulty.data!.title}
                        </label>
                      ))
                    }
                  >
                    {(difficulty) => (
                      <SelectItem
                        key={difficulty.title}
                        className={cn(
                          'font-semibold text-base',
                          difficulty.color
                        )}
                        classNames={{
                          title: 'font-semibold text-base'
                        }}
                      >
                        {difficulty.title}
                      </SelectItem>
                    )}
                  </Select>
                  <Input
                    {...register(`test.${index}.count`, {
                      required: true
                    })}
                    min={1}
                    max={8}
                    type='number'
                    label='Count'
                    classNames={{
                      inputWrapper: 'bg-white w-full sm:w-16',
                      base: 'w-full sm:w-16',
                      label: 'font-semibold text-xs !text-primary-500',
                      input: 'font-semibold text-base !text-primary-700'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            className='w-full bg-white/50 text-primary-700 text-base font-semibold'
            startContent={<i className='fa fa-plus' />}
            onClick={() => {
              append({
                difficulty: 'Medium',
                type: 'Multiple choice',
                count: 1
              });
            }}
          >
            Add a new question group
          </Button>
          <Button
            type='submit'
            className='w-full bg-secondary-500 text-white text-base font-semibold'
            endContent={<i className='fa fa-paper-plane-alt text-xl' />}
          >
            Generate
          </Button>
        </form>
        <label className='text-primary-700 font-semibold text-base pt-11 pb-7 self-center'>
          Or check out previous quizzes
        </label>
        <div className='flex flex-col gap-3'>
          {quizzes.map((quiz) => (
            <Button
              key={quiz.id}
              as={Link}
              href={`/quiz/${quiz.id}`}
              className='!bg-white/70 !rounded-[1.2rem] !p-4 !justify-between !flex !h-auto'
            >
              <div className='flex gap-2'>
                <i className='fa fa-file-lines text-xl text-primary-700' />
                <label className='font-semibold text-base text-primary-700 text-ellipsis overflow-hidden whitespace-nowrap max-w-[50%] sm:max-w-none'>
                  {quiz.files.slice(0, 2).join(', ')}
                  {quiz.files.length > 2
                    ? ` & ${quiz.files.length - 2} more`
                    : ''}
                </label>
              </div>
              <div className='flex items-center text-primary-400 font-semibold text-[0.875rem] gap-2'>
                <label>
                  {('0' + quiz.timestamp.getHours()).slice(-2)}:
                  {('0' + quiz.timestamp.getMinutes()).slice(-2)}
                </label>
                <i className='fa fa-arrow-right text-xl text-primary-700' />
              </div>
            </Button>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}
