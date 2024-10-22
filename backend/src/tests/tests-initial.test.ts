import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { validateCandidateData } from '../application/validator';

jest.mock('../../domain/models/Candidate');
jest.mock('../../domain/models/Education');
jest.mock('../../domain/models/WorkExperience');
jest.mock('../../domain/models/Resume');
jest.mock('../../services/validator');

describe('addCandidate', () => {
    const candidateData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        educations: [{ degree: 'BSc Computer Science', institution: 'University X' }],
        workExperiences: [{ company: 'Company Y', position: 'Developer' }],
        cv: { fileName: 'resume.pdf', fileContent: '...' }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate candidate data', async () => {
        await addCandidate(candidateData);
        expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
    });

    it('should throw an error if validation fails', async () => {
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            throw new Error('Validation error');
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('Validation error');
    });

    it('should save candidate data', async () => {
        const saveMock = jest.fn().mockResolvedValue({ id: '123' });
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: saveMock,
            education: [],
            workExperience: [],
            resumes: []
        }));

        const result = await addCandidate(candidateData);
        expect(saveMock).toHaveBeenCalled();
        expect(result.id).toBe('123');
    });

    it('should save education data', async () => {
        const saveMock = jest.fn().mockResolvedValue({});
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ id: '123' }),
            education: [],
            workExperience: [],
            resumes: []
        }));
        (Education as jest.Mock).mockImplementation(() => ({
            save: saveMock
        }));

        await addCandidate(candidateData);
        expect(Education).toHaveBeenCalledWith(candidateData.educations[0]);
        expect(saveMock).toHaveBeenCalled();
    });

    it('should save work experience data', async () => {
        const saveMock = jest.fn().mockResolvedValue({});
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ id: '123' }),
            education: [],
            workExperience: [],
            resumes: []
        }));
        (WorkExperience as jest.Mock).mockImplementation(() => ({
            save: saveMock
        }));

        await addCandidate(candidateData);
        expect(WorkExperience).toHaveBeenCalledWith(candidateData.workExperiences[0]);
        expect(saveMock).toHaveBeenCalled();
    });

    it('should save resume data', async () => {
        const saveMock = jest.fn().mockResolvedValue({});
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ id: '123' }),
            education: [],
            workExperience: [],
            resumes: []
        }));
        (Resume as jest.Mock).mockImplementation(() => ({
            save: saveMock
        }));

        await addCandidate(candidateData);
        expect(Resume).toHaveBeenCalledWith(candidateData.cv);
        expect(saveMock).toHaveBeenCalled();
    });

    it('should throw an error if email already exists', async () => {
        const saveMock = jest.fn().mockRejectedValue({ code: 'P2002' });
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: saveMock,
            education: [],
            workExperience: [],
            resumes: []
        }));

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });

    it('should throw an error for other database errors', async () => {
        const saveMock = jest.fn().mockRejectedValue(new Error('Database error'));
        (Candidate as jest.Mock).mockImplementation(() => ({
            save: saveMock,
            education: [],
            workExperience: [],
            resumes: []
        }));

        await expect(addCandidate(candidateData)).rejects.toThrow('Database error');
    });
});